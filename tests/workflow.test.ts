import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { expect, test } from "bun:test";

import { canPublish, writeIterationDraft } from "../src/services/workflow.ts";

test("writeIterationDraft marks iterating and injects version", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhs-spec-workflow-"));
  const draftPath = path.join(tempRoot, "draft.v2.md");
  const source = `---\nid: draft-1\nworkflow: quick\nstatus: reviewed\nupdated_at: 2026-03-12T00:00:00.000Z\n---\n\n# Draft\n`;

  await writeIterationDraft(draftPath, source, "2026-03-12T01:00:00.000Z", 2);

  const written = await fs.readFile(draftPath, "utf8");
  expect(written).toContain("status: iterating");
  expect(written).toContain("version: 2");
  expect(written).toContain("updated_at: 2026-03-12T01:00:00.000Z");
});

test("campaign can continue publishing while the series is still reviewing", () => {
  expect(
    canPublish({
      id: "campaign-01",
      workflow: "campaign",
      status: "reviewing",
      path: "/tmp/campaign-01",
      title: "Campaign",
      updatedAt: "2026-03-13T00:00:00.000Z",
      nextStep: "xhs-spec status --target campaign-01",
    }),
  ).toBe(true);
});
