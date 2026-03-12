import { expect, test } from "bun:test";

import { buildKnowledgeEntry, pickKnowledgeFile } from "../src/services/workflow.ts";
import type { RunRecord } from "../src/types.ts";

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

  const entry = buildKnowledgeEntry(run, "completed");
  expect(entry).toContain("- Pattern:");
  expect(entry).toContain("- Why it worked:");
});
