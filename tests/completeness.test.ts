import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { expect, test } from "bun:test";

import {
  assertReadyForArchive,
  assertReadyForDraft,
  assertReadyForIterate,
  assertReadyForReview,
  assertTrendFitCheckComplete,
} from "../src/services/completeness.ts";
import { validateRun } from "../src/repo.ts";
import type { RunRecord } from "../src/types.ts";

test("review gate blocks incomplete quick draft", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhsops-complete-"));
  const runPath = path.join(tempRoot, "quick-1");
  await fs.mkdir(runPath, { recursive: true });
  await fs.writeFile(path.join(runPath, "draft.md"), "---\nid: quick-1\nworkflow: quick\nstatus: drafting\nupdated_at: now\n---\n\n<placeholder>补充正文</placeholder>\n");

  const run: RunRecord = {
    id: "quick-1",
    workflow: "quick",
    status: "drafting",
    path: runPath,
    title: "quick",
    updatedAt: "now",
    nextStep: "",
  };

  await expect(assertReadyForReview(run)).rejects.toThrow("Cannot proceed to review");
});

test("fit gate blocks placeholder trend fit-check", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhsops-fit-"));
  const runPath = path.join(tempRoot, "trend-1");
  await fs.mkdir(runPath, { recursive: true });
  await fs.writeFile(path.join(runPath, "fit-check.md"), "---\nid: trend-1\nworkflow: trend\nstatus: fit-checking\nupdated_at: now\n---\n\n<placeholder>填写 approved 或 rejected</placeholder>\n");

  const run: RunRecord = {
    id: "trend-1",
    workflow: "trend",
    status: "fit-checking",
    path: runPath,
    title: "trend",
    updatedAt: "now",
    nextStep: "",
  };

  await expect(assertTrendFitCheckComplete(run)).rejects.toThrow("Cannot proceed to fit approval");
});

test("archive gate blocks incomplete review", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhsops-archive-"));
  const runPath = path.join(tempRoot, "quick-2");
  await fs.mkdir(runPath, { recursive: true });
  await fs.writeFile(path.join(runPath, "draft.md"), "---\nid: quick-2\nworkflow: quick\nstatus: drafting\nupdated_at: now\n---\n\n完整内容\n");
  await fs.writeFile(path.join(runPath, "review.md"), "---\nid: quick-2-review\nworkflow: quick\nstatus: reviewed\nupdated_at: now\n---\n\n<placeholder>补充 review 结论</placeholder>\n");

  const run: RunRecord = {
    id: "quick-2",
    workflow: "quick",
    status: "reviewed",
    path: runPath,
    title: "quick",
    updatedAt: "now",
    nextStep: "",
  };

  await expect(assertReadyForArchive(run)).rejects.toThrow("Cannot proceed to archive");
});

test("draft gate blocks trend drafting before fit-check is complete", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhsops-draft-trend-"));
  const runPath = path.join(tempRoot, "trend-2");
  await fs.mkdir(runPath, { recursive: true });
  await fs.writeFile(path.join(runPath, "trend-brief.md"), "---\nid: trend-2\nworkflow: trend\nstatus: fit-checking\nupdated_at: now\n---\n\n完整 brief\n");
  await fs.writeFile(path.join(runPath, "fit-check.md"), "---\nid: trend-2\nworkflow: trend\nstatus: fit-checking\nupdated_at: now\n---\n\n<placeholder>填写 approved 或 rejected</placeholder>\n");

  const run: RunRecord = {
    id: "trend-2",
    workflow: "trend",
    status: "fit-approved",
    path: runPath,
    title: "trend",
    updatedAt: "now",
    nextStep: "",
  };

  await expect(assertReadyForDraft(run)).rejects.toThrow("Cannot proceed to draft");
});

test("draft gate blocks campaign drafting when tasks are placeholders", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhsops-draft-campaign-"));
  const runPath = path.join(tempRoot, "campaign-1");
  await fs.mkdir(path.join(runPath, "drafts"), { recursive: true });
  await fs.writeFile(path.join(runPath, "proposal.md"), "---\nid: campaign-1\nworkflow: campaign\nstatus: planned\nupdated_at: now\n---\n\n完整 proposal\n");
  await fs.writeFile(path.join(runPath, "brief.md"), "---\nid: campaign-1\nworkflow: campaign\nstatus: briefing\nupdated_at: now\n---\n\n完整 brief\n");
  await fs.writeFile(path.join(runPath, "tasks.md"), "---\nid: campaign-1\nworkflow: campaign\nstatus: briefing\nupdated_at: now\n---\n\n<placeholder>补充任务拆解</placeholder>\n");

  const run: RunRecord = {
    id: "campaign-1",
    workflow: "campaign",
    status: "planned",
    path: runPath,
    title: "campaign",
    updatedAt: "now",
    nextStep: "",
  };

  await expect(assertReadyForDraft(run, "note-01")).rejects.toThrow("Cannot proceed to draft");
});

test("iterate gate blocks quick iteration when review is incomplete", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhsops-iterate-"));
  const runPath = path.join(tempRoot, "quick-3");
  await fs.mkdir(runPath, { recursive: true });
  await fs.writeFile(path.join(runPath, "review.md"), "---\nid: quick-3-review\nworkflow: quick\nstatus: reviewed\nupdated_at: now\n---\n\n<placeholder>补充 review 结论</placeholder>\n");

  const run: RunRecord = {
    id: "quick-3",
    workflow: "quick",
    status: "reviewed",
    path: runPath,
    title: "quick",
    updatedAt: "now",
    nextStep: "",
  };

  await expect(assertReadyForIterate(run)).rejects.toThrow("Cannot proceed to iteration");
});

test("validate promotes incomplete fit-check to error after trend is approved", async () => {
  const repoRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhsops-validate-"));
  const runPath = path.join(repoRoot, ".xhsops", "trends", "trend-3");
  await fs.mkdir(runPath, { recursive: true });
  await fs.writeFile(path.join(runPath, "run.yaml"), "id: trend-3\nstatus: fit-approved\nupdated_at: now\ntitle: trend\n");
  await fs.writeFile(path.join(runPath, "trend-brief.md"), "---\nid: trend-3\nworkflow: trend\nstatus: fit-checking\nupdated_at: now\n---\n\n完整 brief\n");
  await fs.writeFile(path.join(runPath, "fit-check.md"), "---\nid: trend-3\nworkflow: trend\nstatus: fit-checking\nupdated_at: now\n---\n\n<placeholder>填写 approved 或 rejected</placeholder>\n");

  const issues = await validateRun(repoRoot, "trend-3");
  expect(issues.some((issue) => issue.level === "error" && issue.path.endsWith("fit-check.md"))).toBe(true);
});
