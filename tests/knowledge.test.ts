import { expect, test } from "bun:test";

import { buildKnowledgeEntry, findPublishPackageForRun, pickKnowledgeFile } from "../src/services/workflow.ts";
import type { RunRecord } from "../src/types.ts";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

test("pickKnowledgeFile routes trend lessons to trend-lessons", () => {
  const run: RunRecord = {
    id: "trend-1",
    workflow: "trend",
    status: "reviewed",
    path: "/tmp/trend-1",
    title: "trend",
    updatedAt: "2026-03-12T00:00:00.000Z",
    nextStep: "",
  };

  expect(pickKnowledgeFile(run, "published")).toBe("trend-lessons.md");
});

test("buildKnowledgeEntry produces winning pattern block for completed quick run", () => {
  const run: RunRecord = {
    id: "quick-1",
    workflow: "quick",
    status: "archived",
    path: "/tmp/quick-1",
    title: "quick",
    updatedAt: "2026-03-12T00:00:00.000Z",
    nextStep: "",
  };

  const entry = buildKnowledgeEntry(run, "completed", { publishPackage: "publish/2026-03-13/quick-1-title" });
  expect(entry).toContain("- Pattern:");
  expect(entry).toContain("- Why it worked:");
  expect(entry).toContain("- Publish package: publish/2026-03-13/quick-1-title");
});

test("findPublishPackageForRun returns latest package path for a run", async () => {
  const repoRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhs-spec-publish-link-"));
  const packageDir = path.join(repoRoot, "publish", "2026-03-13", "quick-1-my-title");
  await fs.mkdir(packageDir, { recursive: true });

  const publishPath = await findPublishPackageForRun(repoRoot, "quick-1");

  expect(publishPath).toBe("publish/2026-03-13/quick-1-my-title");
});
