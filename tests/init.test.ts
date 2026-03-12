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

test("init installs selected coding tool integrations", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhsops-init-"));
  const output = run(tempRoot, ["init", "--tools", "codex,cursor,claude-code"]);

  expect(output).toContain("Installed tool integrations: codex, cursor, claude-code");
  expect(await fs.stat(path.join(tempRoot, "AGENTS.md"))).toBeTruthy();
  expect(await fs.stat(path.join(tempRoot, ".cursor", "rules", "xhs-ops.mdc"))).toBeTruthy();
  expect(await fs.stat(path.join(tempRoot, "CLAUDE.md"))).toBeTruthy();
  expect(await fs.stat(path.join(tempRoot, "SKILL.md"))).toBeTruthy();
  expect(await fs.stat(path.join(tempRoot, ".claude", "commands", "xhs-review.md"))).toBeTruthy();
  expect(await fs.stat(path.join(tempRoot, ".claude", "commands", "xhs-rewrite.md"))).toBeTruthy();
  expect(await fs.stat(path.join(tempRoot, ".claude", "commands", "xhs-publish.md"))).toBeTruthy();
  expect(await fs.stat(path.join(tempRoot, ".claude", "commands", "xhs-archive.md"))).toBeTruthy();
  expect(await fs.stat(path.join(tempRoot, ".xhsops", "prompts", "quick-brief.md"))).toBeTruthy();
  expect(await fs.stat(path.join(tempRoot, ".xhsops", "prompts", "rewrite.md"))).toBeTruthy();
  expect(await fs.stat(path.join(tempRoot, ".xhsops", "prompts", "publish.md"))).toBeTruthy();
  expect(await fs.stat(path.join(tempRoot, ".xhsops", "prompts", "archive.md"))).toBeTruthy();

  const config = await fs.readFile(path.join(tempRoot, ".xhsops", "config.yaml"), "utf8");
  const quickDraftTemplate = await fs.readFile(path.join(tempRoot, ".xhsops", "templates", "quick-draft.md"), "utf8");
  const claudeGuide = await fs.readFile(path.join(tempRoot, "CLAUDE.md"), "utf8");
  const brandProfile = await fs.readFile(path.join(tempRoot, ".xhsops", "brand", "profile.md"), "utf8");
  expect(config).toContain("installed_tools:");
  expect(config).toContain("- codex");
  expect(config).toContain("- cursor");
  expect(config).toContain("- claude-code");
  expect(quickDraftTemplate).toContain("<placeholder>");
  expect(claudeGuide).toContain("<placeholder>...</placeholder>");
  expect(brandProfile).toContain("<placeholder>");
});

test("quick creation is blocked until brand positioning is filled", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhsops-brand-gate-"));
  run(tempRoot, ["init", "--tools", "claude-code"]);

  const result = Bun.spawnSync({
    cmd: ["bun", "run", cliPath, "quick", "--idea", "测试选题", "--cwd", tempRoot],
    cwd: process.cwd(),
    stdout: "pipe",
    stderr: "pipe",
  });

  const output = new TextDecoder().decode(result.stderr) || new TextDecoder().decode(result.stdout);
  expect(result.exitCode).toBe(1);
  expect(output).toContain("brand positioning is incomplete");
});
