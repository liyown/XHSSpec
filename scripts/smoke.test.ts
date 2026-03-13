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
  const next = `${frontmatter}${content.startsWith("\n") ? content : `\n${content}`}`;
  await fs.writeFile(filePath, next, "utf8");
}

test("smoke workflow", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhs-spec-"));

  run(tempRoot, ["init"]);
  await fillFile(path.join(tempRoot, ".xhsspec", "brand", "profile.md"), "\n# Brand Profile\n\n- 定位: AI workflow 与开发者效率\n- 目标: 收藏、私信、建立专业信任\n");
  await fillFile(path.join(tempRoot, ".xhsspec", "brand", "audience.md"), "\n# Audience\n\n- 受众: 开发者、技术运营、AI 工具重度用户\n- 主要痛点: 重复劳动多、工具碎片化\n");
  await fillFile(path.join(tempRoot, ".xhsspec", "brand", "offer.md"), "\n# Offer\n\n- 提供: workflow 设计、agent 落地经验、工具实战\n");
  await fillFile(path.join(tempRoot, ".xhsspec", "brand", "tone.md"), "\n# Tone\n\n- 语气: 直接、工程化、少空话\n");
  await fillFile(path.join(tempRoot, ".xhsspec", "brand", "taboo.md"), "\n# Taboo\n\n- 避免: 夸大效果、空洞口号、无来源结论\n");
  run(tempRoot, ["doctor"]);
  run(tempRoot, ["plan", "--theme", "AI效率工具", "--id", "campaign-test"]);
  await fillFile(
    path.join(tempRoot, ".xhsspec", "campaigns", "campaign-test", "proposal.md"),
    "\n# Campaign Proposal\n\n## Goal\n- 验证 AI 效率工具内容是否适合收藏向传播\n\n## Audience\n- 技术团队与效率工具重度用户\n\n## Why now\n- 团队都在关注效率工具落地\n",
  );
  await fillFile(
    path.join(tempRoot, ".xhsspec", "campaigns", "campaign-test", "brief.md"),
    "\n# Campaign Brief\n\n## Direction\n- 以真实效率场景切入\n\n## Key promise\n- 给读者可直接复用的 workflow\n\n## Constraints\n- 避免空泛趋势判断\n",
  );
  await fillFile(
    path.join(tempRoot, ".xhsspec", "campaigns", "campaign-test", "tasks.md"),
    "\n# Campaign Tasks\n\n- [x] 明确 campaign 目标\n- [x] 选定第一篇 angle\n- [x] 准备 note-01 的 hook 和 CTA\n",
  );
  run(tempRoot, ["draft", "--target", "campaign-test", "--note", "note-01"]);
  await fillFile(
    path.join(tempRoot, ".xhsspec", "campaigns", "campaign-test", "drafts", "note-01.md"),
    "\n# Campaign Note Draft\n\n## Hook\n- 完整 hook\n\n## Body\n\n### Problem or context\n- 完整问题\n\n### Insight or method\n- 完整方法\n\n### Concrete takeaway\n- 完整结论\n\n### Closing turn\n- 完整收尾\n\n## CTA\n- Primary CTA: 收藏\n- Why this CTA fits: 品牌匹配\n",
  );
  run(tempRoot, ["review", "--target", "campaign-test", "--note", "note-01"]);
  await fillFile(
    path.join(tempRoot, ".xhsspec", "campaigns", "campaign-test", "reviews", "note-01.review.md"),
    "\n# Review\n\n## Verdict\n- pass with fixes\n\n## Strengths\n- hook 明确\n\n## Issues\n- Highest-priority issue: 补强结尾的行动指令\n- Secondary issue: 方法段再具体一些\n\n## Rewrite Guidance\n- What to change first: 补强 CTA\n- What to preserve: 问题切入与结构\n",
  );
  run(tempRoot, ["iterate", "--target", "campaign-test", "--note", "note-01", "--round", "2"]);
  await fillFile(
    path.join(tempRoot, ".xhsspec", "campaigns", "campaign-test", "drafts", "note-01.v2.md"),
    "\n# Campaign Note Draft\n\n## Hook\n- 二稿 hook\n\n## Body\n\n### Problem or context\n- 二稿问题\n\n### Insight or method\n- 二稿方法\n\n### Concrete takeaway\n- 二稿结论\n\n### Closing turn\n- 二稿收尾\n\n## CTA\n- Primary CTA: 收藏\n- Why this CTA fits: 品牌匹配\n",
  );
  run(tempRoot, ["quick", "--idea", "程序员如何用AI做周报", "--id", "quick-test"]);
  await fillFile(
    path.join(tempRoot, ".xhsspec", "quick", "quick-test", "brief.md"),
    "\n# Quick Brief\n\n## Idea\n- 程序员如何用 AI 做周报\n\n## Angle\n- 从重复劳动节省切入\n\n## CTA\n- 引导收藏与评论交流\n",
  );
  run(tempRoot, ["draft", "--target", "quick-test"]);
  await fillFile(
    path.join(tempRoot, ".xhsspec", "quick", "quick-test", "draft.md"),
    "\n# Draft\n\n## Hook\n- Option 1: 完整 hook\n- Option 2: 备用 hook\n\n## Body\n\n### Problem or context\n- 完整问题\n\n### Insight or method\n- 完整方法\n\n### Concrete takeaway\n- 完整结论\n\n### Closing turn\n- 完整收尾\n\n## CTA\n- Primary CTA: 收藏\n- Why this CTA fits: 品牌匹配\n",
  );
  run(tempRoot, ["hot", "--topic", "OpenAI发布会", "--source", "发布会摘要", "--id", "trend-test"]);
  await fillFile(
    path.join(tempRoot, ".xhsspec", "trends", "trend-test", "trend-brief.md"),
    "\n# Trend Brief\n\n## Topic\n- OpenAI 发布会\n\n## Brand fit hypothesis\n- 从开发者 workflow 变化切入\n\n## Audience takeaway\n- 帮读者判断是否值得关注\n",
  );
  await fillFile(
    path.join(tempRoot, ".xhsspec", "trends", "trend-test", "fit-check.md"),
    "\n# Fit Check\n\n## Verdict\n- approved\n\n## Why it fits\n- Brand relevance: 高\n- Audience usefulness: 高\n- Timing: 高\n\n## Risks\n- Compliance: 低\n- Brand mismatch: 低\n- Genericity risk: 中\n\n## Recommendation\n- Draft\n- Recommended angle if approved: 从工作流角度切入\n",
  );
  run(tempRoot, ["fit", "--target", "trend-test", "--verdict", "approved"]);
  run(tempRoot, ["draft", "--target", "trend-test"]);
  await fillFile(
    path.join(tempRoot, ".xhsspec", "trends", "trend-test", "draft.md"),
    "\n# Trend Draft\n\n## Hook\n- 完整 trend hook\n\n## Body\n- 完整 trend 正文\n\n## CTA\n- 完整 trend CTA\n",
  );
  run(tempRoot, ["review", "--target", "trend-test"]);
  await fillFile(
    path.join(tempRoot, ".xhsspec", "trends", "trend-test", "review.md"),
    "\n# Review\n\n## Verdict\n- pass\n\n## Strengths\n- 趋势判断清晰\n\n## Issues\n- Highest-priority issue: 无\n- Secondary issue: 无\n\n## Rewrite Guidance\n- What to change first: 无\n- What to preserve: 趋势与 workflow 结合角度\n",
  );
  run(tempRoot, ["review", "--target", "quick-test"]);
  await fillFile(
    path.join(tempRoot, ".xhsspec", "quick", "quick-test", "review.md"),
    "\n# Review\n\n## Verdict\n- pass\n\n## Strengths\n- What is already working: 明确\n\n## Issues\n- Highest-priority issue: 无\n- Secondary issue: 无\n- CTA clarity: 通过\n- Taboo compliance: 通过\n- Structural clarity: 通过\n\n## Rewrite Guidance\n- What to change first: 无\n- What to preserve: 当前结构\n",
  );
  run(tempRoot, ["iterate", "--target", "quick-test", "--round", "2"]);
  await fillFile(
    path.join(tempRoot, ".xhsspec", "quick", "quick-test", "draft.v2.md"),
    "\n# Draft\n\n## Hook\n- Option 1: 二稿 hook\n- Option 2: 备用二稿 hook\n\n## Body\n\n### Problem or context\n- 二稿问题\n\n### Insight or method\n- 二稿方法\n\n### Concrete takeaway\n- 二稿结论\n\n### Closing turn\n- 二稿收尾\n\n## CTA\n- Primary CTA: 收藏\n- Why this CTA fits: 品牌匹配\n",
  );
  run(tempRoot, ["review", "--target", "quick-test"]);
  await fillFile(
    path.join(tempRoot, ".xhsspec", "quick", "quick-test", "review.md"),
    "\n# Review\n\n## Verdict\n- pass\n\n## Strengths\n- What is already working: 明确\n\n## Issues\n- Highest-priority issue: 无\n- Secondary issue: 无\n- CTA clarity: 通过\n- Taboo compliance: 通过\n- Structural clarity: 通过\n\n## Rewrite Guidance\n- What to change first: 无\n- What to preserve: 当前结构\n",
  );
  run(tempRoot, ["publish", "--target", "quick-test", "--date", "2026-03-12"]);
  run(tempRoot, ["archive", "--target", "quick-test", "--outcome", "completed"]);
  run(tempRoot, ["hot", "--topic", "无关热点", "--id", "trend-drop"]);
  await fillFile(
    path.join(tempRoot, ".xhsspec", "trends", "trend-drop", "trend-brief.md"),
    "\n# Trend Brief\n\n## Topic\n- 无关热点\n\n## Brand fit hypothesis\n- 与当前品牌关系弱\n\n## Audience takeaway\n- 说明为什么不跟\n",
  );
  await fillFile(
    path.join(tempRoot, ".xhsspec", "trends", "trend-drop", "fit-check.md"),
    "\n# Fit Check\n\n## Verdict\n- rejected\n\n## Why it fits\n- Brand relevance: 低\n- Audience usefulness: 低\n- Timing: 一般\n\n## Risks\n- Compliance: 低\n- Brand mismatch: 高\n- Genericity risk: 高\n\n## Recommendation\n- Drop\n- Recommended angle if approved: 无\n",
  );
  run(tempRoot, ["fit", "--target", "trend-drop", "--verdict", "rejected"]);
  run(tempRoot, ["archive", "--target", "trend-drop", "--outcome", "dropped"]);

  const campaignStatus = run(tempRoot, ["status", "--target", "campaign-test"]);
  const trendStatus = run(tempRoot, ["status", "--target", "trend-test"]);
  const validateOutput = run(tempRoot, ["validate", "--target", "repo"]);

  expect(campaignStatus).toContain("campaign-test");
  expect(trendStatus).toContain("trend-test");
  expect(await fs.stat(path.join(tempRoot, "publish", "2026-03-12"))).toBeTruthy();
  expect(validateOutput).not.toContain("ERROR:");
});
