import path from "node:path";

import type { RunRecord, WorkflowKind } from "../types.ts";
import { getXhsopsPath, suggestNextStep, workflowReferencePaths } from "../repo.ts";
import { createFrontmatter, pathExists, placeholder, readText, toIsoNow, writeText } from "../utils.ts";

export function baseFrontmatter(id: string, workflow: WorkflowKind, status: string): Record<string, string> {
  return {
    id,
    workflow,
    status,
    updated_at: toIsoNow(),
  };
}

export async function updateRunStatus(run: RunRecord, status: string, updatedAt: string): Promise<void> {
  const metaPath = run.workflow === "campaign" ? path.join(run.path, "campaign.yaml") : path.join(run.path, "run.yaml");
  const raw = await readText(metaPath);
  const next = raw
    .replace(/^status:\s*.*$/mu, `status: ${status}`)
    .replace(/^updated_at:\s*.*$/mu, `updated_at: ${updatedAt}`);
  await writeText(metaPath, next.endsWith("\n") ? next : `${next}\n`);
}

export function canReview(run: RunRecord): boolean {
  if (run.workflow === "quick") {
    return run.status === "briefed" || run.status === "drafting" || run.status === "reviewed" || run.status === "iterating";
  }

  if (run.workflow === "trend") {
    return run.status === "fit-approved" || run.status === "drafting" || run.status === "reviewed" || run.status === "iterating";
  }

  return run.status === "drafting" || run.status === "reviewing" || run.status === "iterating" || run.status === "planned" || run.status === "briefing";
}

export function canArchive(run: RunRecord): boolean {
  return run.status === "reviewed" || run.status === "done" || run.status === "dropped" || run.status === "ready" || run.status === "fit-rejected";
}

export function canPublish(run: RunRecord): boolean {
  return run.status === "reviewed" || run.status === "done" || run.status === "ready";
}

export function defaultOutcome(run: RunRecord): string {
  if (run.workflow === "trend") {
    return run.status === "fit-rejected" || run.status === "dropped" ? "dropped" : "published";
  }

  return "completed";
}

export async function appendKnowledgeStub(repoRoot: string, run: RunRecord, outcome: string): Promise<void> {
  const filename = pickKnowledgeFile(run, outcome);
  const filePath = getXhsopsPath(repoRoot, "knowledge", filename);
  const current = await readText(filePath);
  const next = `${current.trimEnd()}\n\n${buildKnowledgeEntry(run, outcome)}\n`;
  await writeText(filePath, `${next}\n`);
}

export function pickKnowledgeFile(run: RunRecord, outcome: string): string {
  if (run.workflow === "trend") {
    return "trend-lessons.md";
  }

  return outcome === "completed" ? "winning-patterns.md" : "failed-patterns.md";
}

export function buildKnowledgeEntry(run: RunRecord, outcome: string): string {
  if (run.workflow === "trend") {
    return [
      `## ${run.id}`,
      "",
      `- Source run: ${run.id}`,
      `- Verdict: ${outcome}`,
      `- Angle: ${placeholder("补充角度")}`,
      `- What made it fit or fail: ${placeholder("补充判断依据")}`,
      `- Risk note: ${placeholder("补充风险说明")}`,
      `- Reuse guidance: ${placeholder("补充复用建议")}`,
    ].join("\n");
  }

  if (outcome === "completed") {
    return [
      `## ${run.id}`,
      "",
      `- Source run: ${run.id}`,
      `- Pattern: ${placeholder("补充有效模式")}`,
      `- Why it worked: ${placeholder("补充成功原因")}`,
      `- Best context to reuse: ${placeholder("补充最佳复用场景")}`,
      `- Watch-out: ${placeholder("补充注意事项")}`,
    ].join("\n");
  }

  return [
    `## ${run.id}`,
    "",
    `- Source run: ${run.id}`,
    `- Failure pattern: ${placeholder("补充失败模式")}`,
    `- Why it failed: ${placeholder("补充失败原因")}`,
    `- How to avoid: ${placeholder("补充规避方式")}`,
    `- When this warning matters most: ${placeholder("补充警告适用场景")}`,
  ].join("\n");
}

export async function listFiles(dirPath: string, suffix: string): Promise<string[]> {
  if (!(await pathExists(dirPath))) {
    return [];
  }

  const fs = await import("node:fs/promises");
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(suffix))
    .map((entry) => entry.name)
    .sort();
}

export function resolveCampaignDraftPath(runPath: string, noteId: string, round: number): string {
  if (round <= 1) {
    return path.join(runPath, "drafts", `${noteId}.md`);
  }

  return path.join(runPath, "drafts", `${noteId}.v${round}.md`);
}

export async function writeIterationDraft(
  targetPath: string,
  sourceContent: string,
  updatedAt: string,
  round: number,
  noteId?: string,
): Promise<void> {
  const parsed = sourceContent.includes("---\n") ? sourceContent : createFrontmatter({}, sourceContent);
  const next = parsed
    .replace(/^status:\s*.*$/mu, "status: iterating")
    .replace(/^updated_at:\s*.*$/mu, `updated_at: ${updatedAt}`);
  const withVersion = next.includes("\nversion:")
    ? next.replace(/^version:\s*.*$/mu, `version: ${round}`)
    : next.replace(/^workflow:\s*.*$/mu, (line) => `${line}\nversion: ${round}${noteId ? `\nnote_id: ${noteId}` : ""}`);
  await writeText(targetPath, withVersion.endsWith("\n") ? withVersion : `${withVersion}\n`);
}

export async function inspectRun(run: RunRecord): Promise<Record<string, unknown>> {
  const fs = await import("node:fs/promises");
  const entries = await fs.readdir(run.path, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name).sort();
  const directories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();

  const detail: Record<string, unknown> = {
    id: run.id,
    workflow: run.workflow,
    status: run.status,
    title: run.title,
    path: run.path,
    next: suggestNextStep(run.workflow, run.status).replace("<id>", run.id),
    files,
    directories,
  };

  const refs = workflowReferencePaths(path.dirname(path.dirname(path.dirname(run.path))), run.workflow);
  detail.spec_refs = refs.specs;
  detail.prompt_refs = refs.prompts;
  detail.command_refs = refs.commands;

  if (run.workflow === "campaign") {
    const drafts = await listFiles(path.join(run.path, "drafts"), ".md");
    const reviews = await listFiles(path.join(run.path, "reviews"), ".md");
    detail.draft_count = drafts.length;
    detail.review_count = reviews.length;
    detail.latest_drafts = drafts.slice(-3);
    detail.latest_reviews = reviews.slice(-3);
  } else {
    const reviewPath = path.join(run.path, "review.md");
    const iterationFiles = await listFiles(run.path, ".md");
    detail.has_review = await pathExists(reviewPath);
    detail.iteration_files = iterationFiles.filter((filename) => filename.includes(".v"));
  }

  return detail;
}
