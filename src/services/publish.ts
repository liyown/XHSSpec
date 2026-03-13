import path from "node:path";

import type { RunRecord } from "../types.ts";
import { parseFrontmatter, placeholder, readText, slugify, writeText, yamlStringify } from "../utils.ts";
import { listFiles, resolveCampaignDraftPath } from "./workflow.ts";

export interface PublishPackage {
  dir: string;
  notePath: string;
  postingGuidePath: string;
  firstScreenPath: string;
  visualPlanPath: string;
  demoPath: string;
  postMetaPath: string;
  title: string;
  style: string;
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
    style: string;
  },
): Promise<PublishPackage> {
  const draftPath = await resolveLatestDraftForPublish(run, options.noteId);
  const draftRaw = await readText(draftPath);
  const { body } = parseFrontmatter(draftRaw);
  const draftModel = parseDraftForPublish(body);
  const campaignStrategy = run.workflow === "campaign" && options.noteId
    ? await readCampaignNoteStrategy(run.path, options.noteId)
    : null;
  const stylePreset = resolvePublishStylePreset(options.style);
  const title = options.titleOverride?.trim() || draftModel.title || run.title;
  const packageSlug = slugify(`${run.id}-${title}`) || run.id;
  const publishDir = path.join(repoRoot, "publish", options.publishDate, packageSlug);

  const notePath = path.join(publishDir, "note.md");
  const postingGuidePath = path.join(publishDir, "posting-guide.md");
  const firstScreenPath = path.join(publishDir, "first-screen.md");
  const visualPlanPath = path.join(publishDir, "visual-plan.md");
  const demoPath = path.join(publishDir, "demo.html");
  const postMetaPath = path.join(publishDir, "post-meta.yaml");

  const noteBody = renderPublishNoteBody(draftModel);
  const visualSlides = buildVisualSlides(draftModel);
  await writeText(notePath, `# ${title}\n\n${noteBody}\n`);
  await writeText(
    firstScreenPath,
    [
      "# First Screen Strategy",
      "",
      "## Positioning",
      `- Final title: ${title}`,
      `- Publish style: ${stylePreset.label} (${stylePreset.id})`,
      ...(campaignStrategy
        ? [
            `- Series role: ${campaignStrategy.role}`,
            `- Angle hypothesis: ${campaignStrategy.angleHypothesis}`,
            `- Publish purpose: ${campaignStrategy.publishPurpose}`,
          ]
        : []),
      "",
      "## Recommended Cover Copy",
      `- First-screen headline: ${draftModel.firstScreenHeadline}`,
      `- Support line: ${draftModel.supportLine}`,
      `- Opening tension: ${draftModel.openingTension}`,
      "",
      "## Execution Notes",
      `- Layout direction: ${draftModel.layoutDirection}`,
      `- Emotional target: ${draftModel.emotionalTarget}`,
      `- Screenshot priority: ${visualSlides[0]?.capture || "优先截封面页，再补一张信息卡"}`,
      `- Avoid: 不要把封面做成信息密度过高的说明页`,
    ].join("\n"),
  );
  await writeText(
    visualPlanPath,
    [
      "# Visual Plan",
      "",
      ...(campaignStrategy
        ? [
            "## Campaign Context",
            `- This note's role in series: ${campaignStrategy.role}`,
            `- Angle to prove visually: ${campaignStrategy.angleHypothesis}`,
            `- Publish objective: ${campaignStrategy.publishPurpose}`,
            "",
          ]
        : []),
      "## Style Direction",
      `- Style preset: ${stylePreset.label}`,
      `- Visual mood: ${stylePreset.visualMood}`,
      `- Best use: ${stylePreset.bestUse}`,
      "",
      "## Storyboard",
      ...visualSlides.flatMap((slide) => [
        `### ${slide.id}`,
        `- Role: ${slide.role}`,
        `- Copy focus: ${slide.copyFocus}`,
        `- Suggested capture: ${slide.capture}`,
        `- Suggested visual: ${slide.visual}`,
        "",
      ]),
      "",
      "## Visual Directions",
      "- Screenshot-ready demo asset: demo.html",
      `- Real image or mockup ideas: ${draftModel.realImageIdeas}`,
      `- Diagram / UI / code capture ideas: ${draftModel.diagramIdeas}`,
      `- Extra assets to prepare: ${draftModel.extraAssets}`,
    ].join("\n"),
  );
  await writeText(
    postingGuidePath,
    [
      "# Posting Guide",
      "",
      `- Publish date: ${options.publishDate}`,
      `- Source run: ${run.id}`,
      `- Workflow: ${run.workflow}`,
      `- Final title: ${title}`,
      `- Publish style: ${stylePreset.label}`,
      ...(campaignStrategy
        ? [
            `- Series role: ${campaignStrategy.role}`,
            `- Publish objective: ${campaignStrategy.publishPurpose}`,
          ]
        : []),
      "",
      "## Before Posting",
      "- [ ] Replace all remaining <placeholder> blocks in publish assets",
      "- [ ] Confirm title is platform-safe and aligned with tone",
      "- [ ] Confirm CTA matches current offer and trust level",
      "- [ ] Prepare cover image and additional visuals",
      "",
      "## Posting Checklist",
      "- [ ] Copy note.md into the publishing surface",
      "- [ ] Upload visuals based on first-screen.md, visual-plan.md, and demo.html screenshots",
      "- [ ] Review first-screen hook, tags, and CTA once more",
      `- [ ] Keep the visual style consistent with ${stylePreset.label}`,
      "",
      "## After Posting",
      "- [ ] Record publish URL or note ID",
      "- [ ] Track comments, saves, follows, and DMs",
      "- [ ] Feed observations back into archive/knowledge",
      ...(campaignStrategy
        ? [
            "",
            "## Series Follow-up",
            `- [ ] Check whether this post achieved its role: ${campaignStrategy.role}`,
            `- [ ] Judge whether it delivered the target behavior: ${campaignStrategy.publishPurpose}`,
            "- [ ] Use the result to decide how to sharpen the next note in the series",
          ]
        : []),
    ].join("\n"),
  );
  await writeText(
    demoPath,
    renderScreenshotDemoHtml(title, draftModel, campaignStrategy, visualSlides, stylePreset),
  );
  await writeText(
    postMetaPath,
    `${yamlStringify({
      run_id: run.id,
      workflow: run.workflow,
      note_id: options.noteId ?? "",
      publish_date: options.publishDate,
      publish_style: stylePreset.id,
      title,
      series_role: campaignStrategy?.role ?? "",
      angle_hypothesis: campaignStrategy?.angleHypothesis ?? "",
      publish_objective: campaignStrategy?.publishPurpose ?? "",
      source_draft: draftPath,
      note_path: notePath,
      demo_path: demoPath,
      first_screen_path: firstScreenPath,
      visual_plan_path: visualPlanPath,
    })}\n`,
  );

  return {
    dir: publishDir,
    notePath,
    postingGuidePath,
    firstScreenPath,
    visualPlanPath,
    demoPath,
    postMetaPath,
    title,
    style: stylePreset.id,
  };
}

function extractTitle(markdown: string): string {
  const line = markdown.split(/\r?\n/u).find((entry) => entry.trim().startsWith("# "));
  return line ? line.replace(/^#\s+/u, "").trim() : "";
}

interface DraftPublishModel {
  title: string;
  hook: string;
  supportLine: string;
  openingTension: string;
  layoutDirection: string;
  emotionalTarget: string;
  bodyParagraphs: string[];
  cta: string;
  firstScreenHeadline: string;
  slide1: string;
  slide2: string;
  slide3: string;
  realImageIdeas: string;
  diagramIdeas: string;
  extraAssets: string;
}

interface CampaignNoteStrategy {
  role: string;
  angleHypothesis: string;
  publishPurpose: string;
}

interface PublishStylePreset {
  id: string;
  label: string;
  visualMood: string;
  bestUse: string;
  bodyBackground: string;
  coverBackground: string;
  ctaBackground: string;
}

function parseDraftForPublish(markdown: string): DraftPublishModel {
  const lines = markdown.split(/\r?\n/u);
  const title = extractTitle(markdown);
  const hookLines = extractSectionBullets(lines, "## Hook");
  const bodyLines = extractSectionBullets(lines, "## Body");
  const problemLines = extractSectionBullets(lines, "### Problem or context");
  const insightLines = extractSectionBullets(lines, "### Insight or method");
  const takeawayLines = extractSectionBullets(lines, "### Concrete takeaway");
  const closingLines = extractSectionBullets(lines, "### Closing turn");
  const ctaLines = extractSectionBullets(lines, "## CTA");

  const fallbackBodyLines = bodyLines.length > 0 ? bodyLines : [];
  const problemOrBodyLines = problemLines.length > 0 ? problemLines : fallbackBodyLines;
  const insightOrBodyLines = insightLines.length > 0 ? insightLines : fallbackBodyLines;
  const takeawayOrBodyLines = takeawayLines.length > 0 ? takeawayLines : fallbackBodyLines;

  const hook = firstMeaningfulLine(hookLines) ?? placeholder("补充首屏主文案");
  const supportLine =
    secondMeaningfulLine(hookLines) ??
    firstMeaningfulLine(takeawayOrBodyLines) ??
    placeholder("补充首屏副文案");
  const openingTension = firstMeaningfulLine(problemOrBodyLines) ?? placeholder("补充首屏冲突点");
  const cta = firstMeaningfulLine(ctaLines) ?? placeholder("补充主 CTA");

  const bodyParagraphs = [problemOrBodyLines, insightOrBodyLines, takeawayOrBodyLines, closingLines]
    .flat()
    .map(cleanBulletValue)
    .filter(Boolean);

  return {
    title,
    hook,
    supportLine,
    openingTension,
    layoutDirection: "标题优先，正文做 2-3 张信息卡，结尾单独放 CTA 截图页",
    emotionalTarget: "专业、清醒、带一点反差感",
    bodyParagraphs,
    cta,
    firstScreenHeadline: hook,
    slide1: `封面页：${trimSentence(hook)}`,
    slide2: `问题与方法页：${trimSentence(firstMeaningfulLine(insightOrBodyLines) ?? openingTension)}`,
    slide3: `结尾与 CTA 页：${trimSentence(cta)}`,
    realImageIdeas: "可以配工作区截图、repo 目录结构图、对话前后对比图",
    diagramIdeas: "适合做 workflow 流程图、前后对比卡、artifact 结构截图",
    extraAssets: "准备一张 repo 结构图或 demo.html 截图作为补充视觉素材",
  };
}

function renderPublishNoteBody(model: DraftPublishModel): string {
  const sections = [
    trimSentence(model.hook),
    trimSentence(model.supportLine),
    ...model.bodyParagraphs.map(trimSentence),
    trimSentence(model.cta),
  ].filter(Boolean);

  return sections.join("\n\n");
}

interface VisualSlidePlan {
  id: string;
  role: string;
  copyFocus: string;
  capture: string;
  visual: string;
}

function buildVisualSlides(model: DraftPublishModel): VisualSlidePlan[] {
  const primaryInsight = model.bodyParagraphs[0] ?? model.openingTension;
  const secondaryInsight = model.bodyParagraphs[1] ?? model.supportLine;
  const finalTurn = model.bodyParagraphs.at(-1) ?? model.cta;

  return [
    {
      id: "Slide 1",
      role: "封面 / 首屏停留",
      copyFocus: trimSentence(model.firstScreenHeadline),
      capture: "截取 cover slide 的标题、support line 与标签区，作为封面草图",
      visual: "大标题 + 副文案 + 浅底色块，保持留白",
    },
    {
      id: "Slide 2",
      role: "问题或方法信息卡",
      copyFocus: trimSentence(primaryInsight),
      capture: `截取正文信息卡，优先保留“${trimSentence(secondaryInsight)}”附近的 2-3 条 bullet`,
      visual: "信息卡片式排版，可叠加 repo、界面或流程截图",
    },
    {
      id: "Slide 3",
      role: "结尾 CTA / 行动页",
      copyFocus: trimSentence(finalTurn),
      capture: "截取 CTA slide，保留一句结论 + 一句行动指令",
      visual: "高对比 CTA 卡片，适合做最后一页",
    },
  ];
}

async function readCampaignNoteStrategy(campaignPath: string, noteId: string): Promise<CampaignNoteStrategy | null> {
  const tasksPath = path.join(campaignPath, "tasks.md");
  const section = await extractCampaignNoteStrategySection(tasksPath, noteId);
  if (!section) {
    return null;
  }

  return {
    role: extractLabeledValue(section, "Role") ?? placeholder("补充该篇在系列中的角色"),
    angleHypothesis: extractLabeledValue(section, "Angle hypothesis") ?? placeholder("补充该篇要验证的角度"),
    publishPurpose: extractLabeledValue(section, "Publish purpose") ?? placeholder("补充该篇的收藏/评论/转化目标"),
  };
}

async function extractCampaignNoteStrategySection(tasksPath: string, noteId: string): Promise<string | null> {
  try {
    const content = await readText(tasksPath);
    const noteHeading = `### ${noteId}`;
    const start = content.indexOf(noteHeading);
    if (start === -1) {
      return null;
    }

    const rest = content.slice(start + noteHeading.length);
    const endMatch = rest.match(/\n## |\n### /u);
    const endIndex = endMatch?.index ?? rest.length;
    return rest.slice(0, endIndex).trim();
  } catch {
    return null;
  }
}

function extractLabeledValue(section: string, label: string): string | null {
  const match = section.match(new RegExp(`- ${escapeRegex(label)}:\\s*(.+)$`, "mu"));
  return match?.[1]?.trim() ?? null;
}

function extractSectionBullets(lines: string[], heading: string): string[] {
  const start = lines.findIndex((line) => line.trim() === heading);
  if (start === -1) {
    return [];
  }

  const section: string[] = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) {
      continue;
    }
    if (/^##\s/u.test(line) || /^###\s/u.test(line)) {
      break;
    }
    if (line.startsWith("- ")) {
      section.push(line);
    }
  }

  return section;
}

function cleanBulletValue(line: string): string {
  return line
    .replace(/^- /u, "")
    .replace(/^Option \d+:\s*/u, "")
    .replace(/^Primary CTA:\s*/u, "")
    .replace(/^Why this CTA fits:\s*/u, "")
    .trim();
}

function firstMeaningfulLine(lines: string[]): string | undefined {
  return lines.map(cleanBulletValue).find((line) => line && !line.includes("<placeholder>"));
}

function secondMeaningfulLine(lines: string[]): string | undefined {
  return lines
    .map(cleanBulletValue)
    .filter((line) => line && !line.includes("<placeholder>"))[1];
}

function trimSentence(value: string): string {
  return value.trim().replace(/\s+/gu, " ");
}

function renderScreenshotDemoHtml(
  title: string,
  model: DraftPublishModel,
  strategy: CampaignNoteStrategy | null,
  slides: VisualSlidePlan[],
  style: PublishStylePreset,
): string {
  const insightItems = model.bodyParagraphs.slice(0, 3);
  return [
    "<!doctype html>",
    "<html lang=\"zh-CN\">",
    "<head>",
    "  <meta charset=\"utf-8\" />",
    `  <title>${escapeHtml(title)}</title>`,
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />",
    "  <style>",
    `    body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; background: ${style.bodyBackground}; color: #1f1a17; }`,
    "    main { max-width: 1200px; margin: 0 auto; padding: 40px 24px 80px; }",
    "    .meta { color: #7a6754; font-size: 0.95rem; margin-bottom: 1rem; }",
    "    .grid { display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }",
    "    .slide { aspect-ratio: 3 / 4; background: #fffdf8; border: 1px solid #e8dfd2; border-radius: 28px; padding: 28px; box-shadow: 0 18px 48px rgba(31,26,23,0.08); overflow: hidden; display: flex; flex-direction: column; gap: 14px; }",
    "    .slide h1, .slide h2, .slide h3 { line-height: 1.2; margin: 0 0 12px; }",
    "    .slide h1 { font-size: 1.8rem; }",
    "    .slide h2 { font-size: 1.25rem; margin-top: 1rem; }",
    "    .slide h3 { font-size: 1rem; margin-top: 0.8rem; }",
    "    .slide p, .slide li { line-height: 1.7; font-size: 0.98rem; }",
    "    .slide ul { padding-left: 1.15rem; margin: 0; }",
    `    .slide--cover { background: ${style.coverBackground}; }`,
    `    .slide--cta { background: ${style.ctaBackground}; }`,
    "    .tag { display: inline-block; font-size: 0.8rem; padding: 6px 10px; border-radius: 999px; background: rgba(31,26,23,0.08); margin-bottom: 16px; }",
    "    .eyebrow { font-size: 0.85rem; color: #7a6754; letter-spacing: 0.04em; text-transform: uppercase; }",
    "    .support { font-size: 1.05rem; color: #5a4634; }",
    "    .callout { margin-top: auto; border-radius: 18px; background: rgba(255,255,255,0.72); padding: 14px 16px; }",
    "  </style>",
    "</head>",
    "<body>",
    "  <main>",
    `    <div class=\"meta\">Screenshot-ready publish demo for ${escapeHtml(title)}</div>`,
    "    <div class=\"grid\">",
    "      <section class=\"slide slide--cover\">",
    `        <div class=\"tag\">${escapeHtml(strategy?.role || "Cover Demo")}</div>`,
    "        <div class=\"eyebrow\">First-screen concept</div>",
    `        <h1>${escapeHtml(title)}</h1>`,
    `        <p class=\"support\">${escapeHtml(model.supportLine)}</p>`,
    `        <p>${escapeHtml(strategy?.angleHypothesis || model.openingTension)}</p>`,
    "        <div class=\"callout\">",
    `          <strong>Style:</strong> ${escapeHtml(style.label)}<br />`,
    `          <strong>Capture:</strong> ${escapeHtml(slides[0]?.capture || "优先截这一页作为封面草图")}`,
    "        </div>",
    "      </section>",
    "      <section class=\"slide\">",
    `        <div class=\"tag\">${escapeHtml(slides[1]?.role || "Information Card")}</div>`,
    `        <h2>${escapeHtml(slides[1]?.copyFocus || model.openingTension)}</h2>`,
    "        <div class=\"eyebrow\">Key points to show</div>",
    "        <ul>",
    ...insightItems.map((item) => `          <li>${escapeHtml(trimSentence(item))}</li>`),
    "        </ul>",
    "        <div class=\"callout\">",
    `          <strong>Suggested visual:</strong> ${escapeHtml(slides[1]?.visual || "信息卡 + 实拍或截图")}`,
    "        </div>",
    "      </section>",
    "      <section class=\"slide slide--cta\">",
    `        <div class=\"tag\">${escapeHtml(strategy?.publishPurpose || "CTA Page")}</div>`,
    `        <h2>${escapeHtml(model.cta)}</h2>`,
    `        <p>${escapeHtml(model.bodyParagraphs.at(-1) ?? model.supportLine)}</p>`,
    "        <div class=\"eyebrow\">Visual Notes</div>",
    "        <ul>",
    "          <li>用高对比标题页做封面草案</li>",
    "          <li>把正文拆成 2-3 张信息卡截图</li>",
    "          <li>关键 CTA 单独做一张结尾页</li>",
    ...(strategy ? [`          <li>这篇内容的发布目标：${escapeHtml(strategy.publishPurpose)}</li>`] : []),
    "        </ul>",
    "        <div class=\"callout\">",
    `          <strong>Capture:</strong> ${escapeHtml(slides[2]?.capture || "保留 CTA 和行动句")}`,
    "        </div>",
    "      </section>",
    "    </div>",
    "  </main>",
    "</body>",
    "</html>",
  ].join("\n");
}

function resolvePublishStylePreset(style: string): PublishStylePreset {
  const key = style.trim().toLowerCase();
  if (key === "warm-editorial") {
    return {
      id: "warm-editorial",
      label: "Warm Editorial",
      visualMood: "柔和、编辑感、适合经验分享和故事型内容",
      bestUse: "适合 build-in-public、经验总结、案例复盘",
      bodyBackground: "linear-gradient(180deg, #f6efe8 0%, #ead8cb 100%)",
      coverBackground: "linear-gradient(145deg, #fff8f1 0%, #efd8c8 100%)",
      ctaBackground: "linear-gradient(145deg, #fff2ec 0%, #efcfc4 100%)",
    };
  }

  if (key === "bold-contrast") {
    return {
      id: "bold-contrast",
      label: "Bold Contrast",
      visualMood: "强对比、判断感强、适合观点型和对比型内容",
      bestUse: "适合误区拆解、观点表达、前后对比",
      bodyBackground: "linear-gradient(180deg, #f3efe8 0%, #ddd2c3 100%)",
      coverBackground: "linear-gradient(145deg, #f9f1cf 0%, #f0b866 100%)",
      ctaBackground: "linear-gradient(145deg, #fbe7d7 0%, #f4b08a 100%)",
    };
  }

  return {
    id: "clean-card",
    label: "Clean Card",
    visualMood: "干净、清晰、适合方法论与工具型内容",
    bestUse: "适合 workflow、教程、结构化拆解",
    bodyBackground: "linear-gradient(180deg, #f7f2e7 0%, #efe4d3 100%)",
    coverBackground: "linear-gradient(145deg, #fff7e9 0%, #f4e4c8 100%)",
    ctaBackground: "linear-gradient(145deg, #fff7f0 0%, #f6ded2 100%)",
  };
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
