import path from "node:path";

import type { RunRecord } from "../types.ts";
import { parseFrontmatter, readText, slugify, writeText, yamlStringify } from "../utils.ts";
import { listFiles, resolveCampaignDraftPath } from "./workflow.ts";

export interface PublishPackage {
  dir: string;
  notePath: string;
  guidePath: string;
  coverBriefPath: string;
  assetsPath: string;
  demoPath: string;
  manifestPath: string;
  title: string;
}

export async function resolveLatestDraftForPublish(run: RunRecord, noteId?: string): Promise<string> {
  if (run.workflow === "campaign") {
    const note = noteId ?? "note-01";
    const draftsDir = path.join(run.path, "drafts");
    const draftFiles = await listFiles(draftsDir, ".md");
    const matching = draftFiles
      .filter((filename) => filename === `${note}.md` || new RegExp(`^${escapeRegex(note)}\\.v\\d+\\.md$`, "u").test(filename))
      .sort();
    if (matching.length === 0) {
      return resolveCampaignDraftPath(run.path, note, 1);
    }

    return path.join(draftsDir, matching.at(-1)!);
  }

  const draftFiles = await listFiles(run.path, ".md");
  const versions = draftFiles.filter((filename) => /^draft(\.v\d+)?\.md$/u.test(filename)).sort();
  return path.join(run.path, versions.at(-1) ?? "draft.md");
}

export async function buildPublishPackage(
  repoRoot: string,
  run: RunRecord,
  options: {
    noteId?: string;
    publishDate: string;
    titleOverride?: string;
  },
): Promise<PublishPackage> {
  const draftPath = await resolveLatestDraftForPublish(run, options.noteId);
  const draftRaw = await readText(draftPath);
  const { body } = parseFrontmatter(draftRaw);
  const title = options.titleOverride?.trim() || extractTitle(body) || run.title;
  const packageSlug = slugify(`${run.id}-${title}`) || run.id;
  const publishDir = path.join(repoRoot, "publish", options.publishDate, packageSlug);

  const notePath = path.join(publishDir, "note.md");
  const guidePath = path.join(publishDir, "publish-guide.md");
  const coverBriefPath = path.join(publishDir, "cover-brief.md");
  const assetsPath = path.join(publishDir, "assets.md");
  const demoPath = path.join(publishDir, "demo.html");
  const manifestPath = path.join(publishDir, "package.yaml");

  const noteBody = body.trim();
  await writeText(notePath, `# ${title}\n\n${noteBody}\n`);
  await writeText(
    coverBriefPath,
    [
      "# Cover Brief",
      "",
      `- Final title: ${title}`,
      "- Cover headline: <placeholder>补充封面主文案</placeholder>",
      "- Visual direction: <placeholder>补充封面视觉方向</placeholder>",
      "- Suggested layout: <placeholder>补充版式建议</placeholder>",
      "- Image or screenshot ideas: <placeholder>补充配图建议</placeholder>",
    ].join("\n"),
  );
  await writeText(
    assetsPath,
    [
      "# Publish Assets",
      "",
      "## Suggested Images",
      "- Image 1: <placeholder>补充首图建议</placeholder>",
      "- Image 2: <placeholder>补充第二张图建议</placeholder>",
      "",
      "## Demo or HTML",
      "- Demo idea: <placeholder>补充 demo 建议</placeholder>",
      "- Screenshot-ready HTML: demo.html",
      "- Extra asset to prepare: <placeholder>补充额外素材</placeholder>",
    ].join("\n"),
  );
  await writeText(
    guidePath,
    [
      "# Publish Guide",
      "",
      `- Publish date: ${options.publishDate}`,
      `- Source run: ${run.id}`,
      `- Workflow: ${run.workflow}`,
      `- Final title: ${title}`,
      "",
      "## Before Posting",
      "- [ ] Replace all remaining <placeholder> blocks in publish assets",
      "- [ ] Confirm title is platform-safe and aligned with tone",
      "- [ ] Confirm CTA matches current offer and trust level",
      "- [ ] Prepare cover image and additional visuals",
      "",
      "## Posting Checklist",
      "- [ ] Copy note.md into the publishing surface",
      "- [ ] Upload visuals based on cover-brief.md, assets.md, and demo.html screenshots",
      "- [ ] Review first-screen hook, tags, and CTA once more",
      "",
      "## After Posting",
      "- [ ] Record publish URL or note ID",
      "- [ ] Track comments, saves, follows, and DMs",
      "- [ ] Feed observations back into archive/knowledge",
    ].join("\n"),
  );
  await writeText(
    demoPath,
    renderScreenshotDemoHtml(title, noteBody),
  );
  await writeText(
    manifestPath,
    `${yamlStringify({
      run_id: run.id,
      workflow: run.workflow,
      note_id: options.noteId ?? "",
      publish_date: options.publishDate,
      title,
      source_draft: draftPath,
      note_path: notePath,
      demo_path: demoPath,
    })}\n`,
  );

  return {
    dir: publishDir,
    notePath,
    guidePath,
    coverBriefPath,
    assetsPath,
    demoPath,
    manifestPath,
    title,
  };
}

function extractTitle(markdown: string): string {
  const line = markdown.split(/\r?\n/u).find((entry) => entry.trim().startsWith("# "));
  return line ? line.replace(/^#\s+/u, "").trim() : "";
}

function renderScreenshotDemoHtml(title: string, markdownBody: string): string {
  const htmlBody = markdownToHtml(markdownBody);
  return [
    "<!doctype html>",
    "<html lang=\"zh-CN\">",
    "<head>",
    "  <meta charset=\"utf-8\" />",
    `  <title>${escapeHtml(title)}</title>`,
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />",
    "  <style>",
    "    body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; background: linear-gradient(180deg, #f7f2e7 0%, #efe4d3 100%); color: #1f1a17; }",
    "    main { max-width: 1200px; margin: 0 auto; padding: 40px 24px 80px; }",
    "    .meta { color: #7a6754; font-size: 0.95rem; margin-bottom: 1rem; }",
    "    .grid { display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }",
    "    .slide { aspect-ratio: 3 / 4; background: #fffdf8; border: 1px solid #e8dfd2; border-radius: 28px; padding: 28px; box-shadow: 0 18px 48px rgba(31,26,23,0.08); overflow: hidden; }",
    "    .slide h1, .slide h2, .slide h3 { line-height: 1.2; margin: 0 0 12px; }",
    "    .slide h1 { font-size: 1.8rem; }",
    "    .slide h2 { font-size: 1.25rem; margin-top: 1rem; }",
    "    .slide h3 { font-size: 1rem; margin-top: 0.8rem; }",
    "    .slide p, .slide li { line-height: 1.7; font-size: 0.98rem; }",
    "    .slide ul { padding-left: 1.15rem; margin: 0; }",
    "    .slide--cover { background: linear-gradient(145deg, #fff7e9 0%, #f4e4c8 100%); }",
    "    .tag { display: inline-block; font-size: 0.8rem; padding: 6px 10px; border-radius: 999px; background: rgba(31,26,23,0.08); margin-bottom: 16px; }",
    "  </style>",
    "</head>",
    "<body>",
    "  <main>",
    `    <div class=\"meta\">Screenshot-ready publish demo for ${escapeHtml(title)}</div>`,
    "    <div class=\"grid\">",
    "      <section class=\"slide slide--cover\">",
    "        <div class=\"tag\">Cover Demo</div>",
    `        <h1>${escapeHtml(title)}</h1>`,
    "        <p>这个页面不是阅读预览，而是可截图的发布演示稿。你可以基于每张 slide 的布局直接截图，作为封面或配图草案。</p>",
    "      </section>",
    `      <section class=\"slide\">${htmlBody}</section>`,
    "      <section class=\"slide\">",
    "        <div class=\"tag\">Visual Notes</div>",
    "        <h2>Suggested Screenshot Directions</h2>",
    "        <ul>",
    "          <li>用高对比标题页做封面草案</li>",
    "          <li>把正文拆成 2-3 张信息卡截图</li>",
    "          <li>关键 CTA 单独做一张结尾页</li>",
    "        </ul>",
    "      </section>",
    "    </div>",
    "  </main>",
    "</body>",
    "</html>",
  ].join("\n");
}

function markdownToHtml(markdown: string): string {
  const lines = markdown.split(/\r?\n/u);
  const html: string[] = [];
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      continue;
    }

    if (line.startsWith("# ")) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h1>${escapeHtml(line.slice(2))}</h1>`);
      continue;
    }
    if (line.startsWith("## ")) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("### ")) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h3>${escapeHtml(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith("- ")) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${escapeHtml(line.slice(2))}</li>`);
      continue;
    }

    if (inList) {
      html.push("</ul>");
      inList = false;
    }
    html.push(`<p>${escapeHtml(line)}</p>`);
  }

  if (inList) {
    html.push("</ul>");
  }

  return html.join("\n");
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
