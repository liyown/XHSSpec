import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { expect, test } from "bun:test";

const cliPath = path.resolve("src/cli.ts");

function run(tempRoot: string, args: string[]) {
  const result = Bun.spawnSync({
    cmd: ["bun", "run", cliPath, ...args, "--cwd", tempRoot],
    cwd: process.cwd(),
    stdout: "pipe",
    stderr: "pipe",
  });

  if (result.exitCode !== 0) {
    throw new Error(new TextDecoder().decode(result.stderr) || new TextDecoder().decode(result.stdout));
  }

  return new TextDecoder().decode(result.stdout).trim();
}

async function fillFile(filePath: string, content: string) {
  const current = await fs.readFile(filePath, "utf8");
  const match = current.match(/^---[\s\S]*?---\n?/u);
  const frontmatter = match ? match[0] : "";
  await fs.writeFile(filePath, `${frontmatter}${content.startsWith("\n") ? content : `\n${content}`}`, "utf8");
}

test("publish creates screenshot-ready package from reviewed quick run", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhs-spec-publish-"));
  run(tempRoot, ["init"]);
  await fillFile(path.join(tempRoot, ".xhsspec", "brand", "profile.md"), "\n# Brand Profile\n\n- Positioning: AI workflow\n");
  await fillFile(path.join(tempRoot, ".xhsspec", "brand", "audience.md"), "\n# Audience\n\n- Core audience: 开发者\n");
  await fillFile(path.join(tempRoot, ".xhsspec", "brand", "offer.md"), "\n# Offer\n\n- Primary offer: workflow 咨询\n");
  await fillFile(path.join(tempRoot, ".xhsspec", "brand", "tone.md"), "\n# Tone\n\n- Tone keywords: 直接、专业\n");
  await fillFile(path.join(tempRoot, ".xhsspec", "brand", "taboo.md"), "\n# Taboo\n\n- Avoid empty hype\n");

  run(tempRoot, ["quick", "--idea", "AI 工作流", "--id", "quick-publish"]);
  await fillFile(
    path.join(tempRoot, ".xhsspec", "quick", "quick-publish", "draft.md"),
    "\n# 我如何用 AI 工作流省 2 小时\n\n## Hook\n- 每天少做 2 小时重复劳动\n\n## Body\n- 真实方法\n\n## CTA\n- 收藏这套方法\n",
  );
  run(tempRoot, ["review", "--target", "quick-publish"]);
  await fillFile(
    path.join(tempRoot, ".xhsspec", "quick", "quick-publish", "review.md"),
    "\n# Review\n\n## Verdict\n- pass\n\n## Strengths\n- What is already working: 明确\n\n## Issues\n- Highest-priority issue: 无\n- Secondary issue: 无\n- CTA clarity: 通过\n- Taboo compliance: 通过\n- Structural clarity: 通过\n\n## Rewrite Guidance\n- What to change first: 无\n- What to preserve: 当前结构\n",
  );

  const output = run(tempRoot, ["publish", "--target", "quick-publish", "--date", "2026-03-12", "--style", "warm-editorial"]);

  expect(output).toContain("Created publish package for quick-publish");
  expect(await fs.stat(path.join(tempRoot, "publish", "2026-03-12"))).toBeTruthy();

  const publishRoot = path.join(tempRoot, "publish", "2026-03-12");
  const entries = await fs.readdir(publishRoot);
  expect(entries.length).toBe(1);

  const packageDir = path.join(publishRoot, entries[0]);
  expect(await fs.stat(path.join(packageDir, "note.md"))).toBeTruthy();
  expect(await fs.stat(path.join(packageDir, "first-screen.md"))).toBeTruthy();
  expect(await fs.stat(path.join(packageDir, "visual-plan.md"))).toBeTruthy();
  expect(await fs.stat(path.join(packageDir, "demo.html"))).toBeTruthy();
  expect(await fs.stat(path.join(packageDir, "posting-guide.md"))).toBeTruthy();
  expect(await fs.stat(path.join(packageDir, "post-meta.yaml"))).toBeTruthy();

  const note = await fs.readFile(path.join(packageDir, "note.md"), "utf8");
  const firstScreen = await fs.readFile(path.join(packageDir, "first-screen.md"), "utf8");
  const visualPlan = await fs.readFile(path.join(packageDir, "visual-plan.md"), "utf8");
  const demo = await fs.readFile(path.join(packageDir, "demo.html"), "utf8");
  const postMeta = await fs.readFile(path.join(packageDir, "post-meta.yaml"), "utf8");

  expect(note).not.toContain("# Draft");
  expect(note).not.toContain("Option 1:");
  expect(note).toContain("每天少做 2 小时重复劳动");
  expect(output).toContain("Style: warm-editorial");
  expect(firstScreen).toContain("First-screen headline:");
  expect(firstScreen).toContain("## Recommended Cover Copy");
  expect(firstScreen).toContain("## Execution Notes");
  expect(firstScreen).toContain("Publish style: Warm Editorial (warm-editorial)");
  expect(firstScreen).not.toContain("<placeholder>补充首屏主文案</placeholder>");
  expect(visualPlan).toContain("### Slide 1");
  expect(visualPlan).toContain("Role: 封面 / 首屏停留");
  expect(visualPlan).toContain("Suggested capture:");
  expect(visualPlan).toContain("Style preset: Warm Editorial");
  expect(visualPlan).not.toContain("<placeholder>补充封面或首图角色</placeholder>");
  expect(demo).toContain("Warm Editorial");
  expect(postMeta).toContain("publish_style: warm-editorial");
});

test("campaign publish is reflected in status output right after publish", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhs-spec-campaign-publish-status-"));
  run(tempRoot, ["init"]);
  await fillFile(path.join(tempRoot, ".xhsspec", "brand", "profile.md"), "\n# Brand Profile\n\n- Positioning: AI workflow\n");
  await fillFile(path.join(tempRoot, ".xhsspec", "brand", "audience.md"), "\n# Audience\n\n- Core audience: 开发者\n");
  await fillFile(path.join(tempRoot, ".xhsspec", "brand", "offer.md"), "\n# Offer\n\n- Primary offer: workflow 咨询\n");
  await fillFile(path.join(tempRoot, ".xhsspec", "brand", "tone.md"), "\n# Tone\n\n- Tone keywords: 直接、专业\n");
  await fillFile(path.join(tempRoot, ".xhsspec", "brand", "taboo.md"), "\n# Taboo\n\n- Avoid empty hype\n");

  run(tempRoot, ["plan", "--theme", "AI workflow", "--count", "2", "--id", "campaign-publish"]);
  await fillFile(
    path.join(tempRoot, ".xhsspec", "campaigns", "campaign-publish", "proposal.md"),
    "\n# Campaign Proposal\n\n- Goal: growth\n- Theme: AI workflow\n- Window: weekly\n- Planned notes: 2\n- Primary audience: 开发者\n- Success signal: 收藏和关注\n\n## Strategy\n- Pillar mix: 认知篇 / 方法篇\n- Test angles: workflow 落地\n- Sequence logic: 从认知到方法\n",
  );
  await fillFile(
    path.join(tempRoot, ".xhsspec", "campaigns", "campaign-publish", "brief.md"),
    "\n# Campaign Brief\n\n- Audience target: 开发者\n- Message territory: AI workflow\n- Success metric: 收藏和关注\n- CTA policy: Follow brand and note spec\n- Campaign thesis: AI 需要 workflow，不只是 prompt\n- Narrative arc across notes: 认知篇 -> 方法篇\n- Proof assets or examples: repo 与命令行\n",
  );
  await fillFile(
    path.join(tempRoot, ".xhsspec", "campaigns", "campaign-publish", "tasks.md"),
    "\n# Tasks\n\n## Note Strategy\n\n### note-01\n- Role: 认知篇\n- Angle hypothesis: 先讲误区\n- Publish purpose: 收藏\n\n### note-02\n- Role: 方法篇\n- Angle hypothesis: 讲 workflow\n- Publish purpose: 关注\n\n## Execution Board\n\n- [ ] note-01 draft\n- [ ] note-01 review\n- [ ] note-01 publish\n- [ ] note-01 rewrite if needed\n- [ ] note-02 draft\n- [ ] note-02 review\n- [ ] note-02 publish\n- [ ] note-02 rewrite if needed\n- [ ] Retrospective\n",
  );

  run(tempRoot, ["draft", "--target", "campaign-publish", "--note", "note-01"]);
  await fillFile(
    path.join(tempRoot, ".xhsspec", "campaigns", "campaign-publish", "drafts", "note-01.md"),
    "\n# Campaign Note Draft\n\n## Hook\n- Option 1: AI 不该只是一次性写手\n- Option 2: 你的 prompt 可能只是把问题藏起来了\n\n## Body\n\n### Problem or context\n- 每次都重新输入上下文\n\n### Insight or method\n- 用 repo 把规范和产物沉淀下来\n\n### Concrete takeaway\n- 先拆成 spec draft review publish\n\n### Closing turn\n- 让 agent 接着往下干\n\n## CTA\n- Primary CTA: 收藏这篇\n- Why this CTA fits: 认知篇适合收藏\n",
  );
  run(tempRoot, ["review", "--target", "campaign-publish", "--note", "note-01"]);
  await fillFile(
    path.join(tempRoot, ".xhsspec", "campaigns", "campaign-publish", "reviews", "note-01.review.md"),
    "\n# Review\n\n## Verdict\n- pass\n\n## Strengths\n- What is already working: 明确\n\n## Issues\n- Highest-priority issue: 无\n- Secondary issue: 无\n- CTA clarity: 通过\n- Taboo compliance: 通过\n- Structural clarity: 通过\n\n## Rewrite Guidance\n- What to change first: 无\n- What to preserve: 当前结构\n",
  );

  run(tempRoot, ["publish", "--target", "campaign-publish", "--note", "note-01", "--date", "2026-03-13", "--title", "AI 不是一次性写手"]);
  const statusJson = run(tempRoot, ["status", "--target", "campaign-publish", "--json"]);
  const detail = JSON.parse(statusJson) as Record<string, unknown>;
  const publishRoot = path.join(tempRoot, "publish", "2026-03-13");
  const entries = await fs.readdir(publishRoot);
  expect(entries.length).toBe(1);
  const packageDir = path.join(publishRoot, entries[0]);
  const firstScreen = await fs.readFile(path.join(packageDir, "first-screen.md"), "utf8");
  const visualPlan = await fs.readFile(path.join(packageDir, "visual-plan.md"), "utf8");
  const postingGuide = await fs.readFile(path.join(packageDir, "posting-guide.md"), "utf8");
  const postMeta = await fs.readFile(path.join(packageDir, "post-meta.yaml"), "utf8");
  const demo = await fs.readFile(path.join(packageDir, "demo.html"), "utf8");

  expect(detail.status).toBe("reviewing");
  expect(detail.next_note).toBe("note-02");
  expect(Array.isArray(detail.campaign_board)).toBe(true);
  expect((detail.campaign_board as string[])).toContain("note-01: draft / review / published");
  expect(Array.isArray(detail.campaign_summary)).toBe(true);
  expect((detail.campaign_summary as string[])).toContain("published notes: 1");
  expect(Array.isArray(detail.publish_timeline)).toBe(true);
  expect((detail.publish_timeline as string[])).toContain("2026-03-13: note-01 (AI 不是一次性写手)");
  expect(firstScreen).toContain("Series role: 认知篇");
  expect(firstScreen).toContain("Angle hypothesis: 先讲误区");
  expect(firstScreen).toContain("Publish purpose: 收藏");
  expect(visualPlan).toContain("## Campaign Context");
  expect(visualPlan).toContain("This note's role in series: 认知篇");
  expect(postingGuide).toContain("## Series Follow-up");
  expect(postMeta).toContain("series_role: 认知篇");
  expect(postMeta).toContain("angle_hypothesis: 先讲误区");
  expect(postMeta).toContain("publish_objective: 收藏");
  expect(postMeta).toContain("publish_style: clean-card");
  expect(demo).toContain(">认知篇<");
  expect(demo).toContain("先讲误区");
  expect(demo).toContain("这篇内容的发布目标：收藏");
  expect(demo).toContain("First-screen concept");
  expect(demo).toContain("Key points to show");
});
