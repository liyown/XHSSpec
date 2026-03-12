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
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhsops-publish-"));
  run(tempRoot, ["init"]);
  await fillFile(path.join(tempRoot, ".xhsops", "brand", "profile.md"), "\n# Brand Profile\n\n- Positioning: AI workflow\n");
  await fillFile(path.join(tempRoot, ".xhsops", "brand", "audience.md"), "\n# Audience\n\n- Core audience: 开发者\n");
  await fillFile(path.join(tempRoot, ".xhsops", "brand", "offer.md"), "\n# Offer\n\n- Primary offer: workflow 咨询\n");
  await fillFile(path.join(tempRoot, ".xhsops", "brand", "tone.md"), "\n# Tone\n\n- Tone keywords: 直接、专业\n");
  await fillFile(path.join(tempRoot, ".xhsops", "brand", "taboo.md"), "\n# Taboo\n\n- Avoid empty hype\n");

  run(tempRoot, ["quick", "--idea", "AI 工作流", "--id", "quick-publish"]);
  await fillFile(
    path.join(tempRoot, ".xhsops", "quick", "quick-publish", "draft.md"),
    "\n# 我如何用 AI 工作流省 2 小时\n\n## Hook\n- 每天少做 2 小时重复劳动\n\n## Body\n- 真实方法\n\n## CTA\n- 收藏这套方法\n",
  );
  run(tempRoot, ["review", "--target", "quick-publish"]);
  await fillFile(
    path.join(tempRoot, ".xhsops", "quick", "quick-publish", "review.md"),
    "\n# Review\n\n## Verdict\n- pass\n\n## Strengths\n- What is already working: 明确\n\n## Issues\n- Highest-priority issue: 无\n- Secondary issue: 无\n- CTA clarity: 通过\n- Taboo compliance: 通过\n- Structural clarity: 通过\n\n## Rewrite Guidance\n- What to change first: 无\n- What to preserve: 当前结构\n",
  );

  const output = run(tempRoot, ["publish", "--target", "quick-publish", "--date", "2026-03-12"]);

  expect(output).toContain("Created publish package for quick-publish");
  expect(await fs.stat(path.join(tempRoot, "publish", "2026-03-12"))).toBeTruthy();

  const publishRoot = path.join(tempRoot, "publish", "2026-03-12");
  const entries = await fs.readdir(publishRoot);
  expect(entries.length).toBe(1);

  const packageDir = path.join(publishRoot, entries[0]);
  expect(await fs.stat(path.join(packageDir, "note.md"))).toBeTruthy();
  expect(await fs.stat(path.join(packageDir, "cover-brief.md"))).toBeTruthy();
  expect(await fs.stat(path.join(packageDir, "assets.md"))).toBeTruthy();
  expect(await fs.stat(path.join(packageDir, "demo.html"))).toBeTruthy();
  expect(await fs.stat(path.join(packageDir, "publish-guide.md"))).toBeTruthy();
});
