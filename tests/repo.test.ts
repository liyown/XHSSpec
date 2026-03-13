import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { expect, test } from "bun:test";

import { validateRepo, validateRun } from "../src/repo.ts";

test("validateRun reports missing quick workflow artifacts", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhs-spec-repo-"));
  const runPath = path.join(tempRoot, ".xhsspec", "quick", "quick-test");

  await fs.mkdir(runPath, { recursive: true });
  await fs.writeFile(
    path.join(runPath, "run.yaml"),
    "id: quick-test\nworkflow: quick\nstatus: drafting\nupdated_at: 2026-03-12T00:00:00.000Z\n",
  );

  const issues = await validateRun(tempRoot, "quick-test");

  expect(issues.some((issue) => issue.path.endsWith("brief.md"))).toBe(true);
  expect(issues.some((issue) => issue.path.endsWith("draft.md"))).toBe(true);
});

test("validateRepo reports incomplete brand positioning as error", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhs-spec-brand-validate-"));
  const brandDir = path.join(tempRoot, ".xhsspec", "brand");
  const strategyDir = path.join(tempRoot, ".xhsspec", "strategy");
  const specsDir = path.join(tempRoot, ".xhsspec", "specs");

  await fs.mkdir(brandDir, { recursive: true });
  await fs.mkdir(strategyDir, { recursive: true });
  await fs.mkdir(specsDir, { recursive: true });
  await fs.writeFile(path.join(tempRoot, ".xhsspec", "config.yaml"), "name: test\n");
  await fs.writeFile(path.join(brandDir, "profile.md"), "<placeholder>补充品牌定位</placeholder>\n");
  await fs.writeFile(path.join(brandDir, "audience.md"), "完整 audience\n");
  await fs.writeFile(path.join(brandDir, "offer.md"), "完整 offer\n");
  await fs.writeFile(path.join(brandDir, "tone.md"), "完整 tone\n");
  await fs.writeFile(path.join(brandDir, "taboo.md"), "完整 taboo\n");
  await fs.writeFile(path.join(strategyDir, "content-pillars.md"), "完整 pillars\n");
  await fs.writeFile(path.join(strategyDir, "topic-frameworks.md"), "完整 frameworks\n");
  await fs.writeFile(path.join(strategyDir, "keyword-map.md"), "完整 keywords\n");
  await fs.writeFile(path.join(specsDir, "note.spec.md"), "完整 note spec\n");
  await fs.writeFile(path.join(specsDir, "creation.spec.md"), "完整 creation spec\n");
  await fs.writeFile(path.join(specsDir, "review.spec.md"), "完整 review spec\n");
  await fs.writeFile(path.join(specsDir, "trend.spec.md"), "完整 trend spec\n");

  const issues = await validateRepo(tempRoot);

  expect(
    issues.some(
      (issue) =>
        issue.level === "error" &&
        issue.path.endsWith(path.join(".xhsspec", "brand", "profile.md")) &&
        issue.message.includes("Brand positioning"),
    ),
  ).toBe(true);
});

test("validateRepo reports missing command and prompt contracts", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhs-spec-contracts-"));
  const brandDir = path.join(tempRoot, ".xhsspec", "brand");
  const strategyDir = path.join(tempRoot, ".xhsspec", "strategy");
  const specsDir = path.join(tempRoot, ".xhsspec", "specs");
  const commandsDir = path.join(tempRoot, ".xhsspec", "commands");
  const promptsDir = path.join(tempRoot, ".xhsspec", "prompts");

  await fs.mkdir(brandDir, { recursive: true });
  await fs.mkdir(strategyDir, { recursive: true });
  await fs.mkdir(specsDir, { recursive: true });
  await fs.mkdir(commandsDir, { recursive: true });
  await fs.mkdir(promptsDir, { recursive: true });
  await fs.writeFile(path.join(tempRoot, ".xhsspec", "config.yaml"), "name: test\n");
  await fs.writeFile(path.join(brandDir, "profile.md"), "完整 profile\n");
  await fs.writeFile(path.join(brandDir, "audience.md"), "完整 audience\n");
  await fs.writeFile(path.join(brandDir, "offer.md"), "完整 offer\n");
  await fs.writeFile(path.join(brandDir, "tone.md"), "完整 tone\n");
  await fs.writeFile(path.join(brandDir, "taboo.md"), "完整 taboo\n");
  await fs.writeFile(path.join(strategyDir, "content-pillars.md"), "完整 pillars\n");
  await fs.writeFile(path.join(strategyDir, "topic-frameworks.md"), "完整 frameworks\n");
  await fs.writeFile(path.join(strategyDir, "keyword-map.md"), "完整 keywords\n");
  await fs.writeFile(path.join(specsDir, "note.spec.md"), "完整 note spec\n");
  await fs.writeFile(path.join(specsDir, "creation.spec.md"), "完整 creation spec\n");
  await fs.writeFile(path.join(specsDir, "review.spec.md"), "完整 review spec\n");
  await fs.writeFile(path.join(specsDir, "trend.spec.md"), "完整 trend spec\n");
  await fs.writeFile(path.join(specsDir, "slash-commands.md"), "完整 slash commands\n");

  const issues = await validateRepo(tempRoot);

  expect(issues.some((issue) => issue.path.endsWith(path.join(".xhsspec", "commands", "xhs-quick.md")))).toBe(true);
  expect(issues.some((issue) => issue.path.endsWith(path.join(".xhsspec", "prompts", "quick-brief.md")))).toBe(true);
});
