import path from "node:path";

import type { RunRecord, WorkflowKind } from "../types.ts";
import { getXhsSpecPath, suggestNextStep, workflowReferencePaths } from "../repo.ts";
import {
  describeCampaignBoard,
  describeCampaignBoardSummary,
  describeCampaignPublishTimeline,
  describeNextCampaignAction,
  explainNextCampaignNote,
  recommendNextCampaignNote,
} from "./campaign.ts";
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
    return run.status === "created" || run.status === "briefed" || run.status === "drafting" || run.status === "reviewed" || run.status === "iterating";
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
  if (run.workflow === "campaign") {
    return run.status === "drafting" || run.status === "reviewing" || run.status === "iterating" || run.status === "ready";
  }

  return run.status === "reviewed" || run.status === "done" || run.status === "ready";
}

export function defaultOutcome(run: RunRecord): string {
  if (run.workflow === "trend") {
    return run.status === "fit-rejected" || run.status === "dropped" ? "dropped" : "published";
  }

  return "completed";
}

export async function appendKnowledgeStub(
  repoRoot: string,
  run: RunRecord,
  outcome: string,
  options: { publishPackage?: string } = {},
): Promise<string> {
  const filename = pickKnowledgeFile(run, outcome);
  const filePath = getXhsSpecPath(repoRoot, "knowledge", filename);
  const current = await readText(filePath);
  const next = `${current.trimEnd()}\n\n${buildKnowledgeEntry(run, outcome, options)}\n`;
  await writeText(filePath, `${next}\n`);
  return filename;
}

export function pickKnowledgeFile(run: RunRecord, outcome: string): string {
  if (run.workflow === "trend") {
    return "trend-lessons.md";
  }

  return outcome === "completed" ? "winning-patterns.md" : "failed-patterns.md";
}

export function buildKnowledgeEntry(
  run: RunRecord,
  outcome: string,
  options: { publishPackage?: string } = {},
): string {
  const publishPackage = options.publishPackage ?? placeholder("补充发布包路径或说明未生成");

  if (run.workflow === "trend") {
    return [
      `## ${run.id}`,
      "",
      `- Source run: ${run.id}`,
      `- Workflow: ${run.workflow}`,
      `- Verdict: ${outcome}`,
      `- Publish package: ${publishPackage}`,
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
      `- Workflow: ${run.workflow}`,
      `- Outcome: ${outcome}`,
      `- Publish package: ${publishPackage}`,
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
    `- Workflow: ${run.workflow}`,
    `- Outcome: ${outcome}`,
    `- Publish package: ${publishPackage}`,
    `- Failure pattern: ${placeholder("补充失败模式")}`,
    `- Why it failed: ${placeholder("补充失败原因")}`,
    `- How to avoid: ${placeholder("补充规避方式")}`,
    `- When this warning matters most: ${placeholder("补充警告适用场景")}`,
  ].join("\n");
}

export async function findPublishPackageForRun(repoRoot: string, runId: string): Promise<string | null> {
  const publishRoot = path.join(repoRoot, "publish");
  if (!(await pathExists(publishRoot))) {
    return null;
  }

  const fs = await import("node:fs/promises");
  const dateDirs = await fs.readdir(publishRoot, { withFileTypes: true });

  for (const dateDir of dateDirs.filter((entry) => entry.isDirectory()).sort().reverse()) {
    const datedPath = path.join(publishRoot, dateDir.name);
    const packageDirs = await fs.readdir(datedPath, { withFileTypes: true });
    const match = packageDirs
      .filter((entry) => entry.isDirectory() && (entry.name === runId || entry.name.startsWith(`${runId}-`)))
      .map((entry) => path.join("publish", dateDir.name, entry.name))
      .sort()
      .at(-1);

    if (match) {
      return match;
    }
  }

  return null;
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
  detail.human_next = describeHumanNext(run);
  detail.agent_next = describeAgentNext(run, refs);

  if (run.workflow === "campaign") {
    const drafts = await listFiles(path.join(run.path, "drafts"), ".md");
    const reviews = await listFiles(path.join(run.path, "reviews"), ".md");
    detail.draft_count = drafts.length;
    detail.review_count = reviews.length;
    detail.latest_drafts = drafts.slice(-3);
    detail.latest_reviews = reviews.slice(-3);
    detail.campaign_board = await describeCampaignBoard(run.path);
    detail.campaign_summary = await describeCampaignBoardSummary(run.path);
    detail.publish_timeline = await describeCampaignPublishTimeline(run.path);
    const nextNote = await recommendNextCampaignNote(run.path);
    const nextNoteReason = await explainNextCampaignNote(run.path);
    const nextAction = await describeNextCampaignAction(run.path);
    detail.next_note = nextNote;
    detail.next_note_reason = nextNoteReason;
    detail.next_action = nextAction;
    if (nextNote) {
      detail.agent_message = buildCampaignAgentMessage(nextNote, nextAction, nextNoteReason);
    }
    if (nextNote && run.status !== "created" && run.status !== "archived" && run.status !== "cancelled") {
      detail.human_next = nextNoteReason
        ? `Ask the agent to keep progressing ${nextNote} inside this campaign. ${nextNoteReason}`
        : `Ask the agent to keep progressing ${nextNote} inside this campaign.`;
    }
  } else {
    const reviewPath = path.join(run.path, "review.md");
    const iterationFiles = await listFiles(run.path, ".md");
    detail.has_review = await pathExists(reviewPath);
    detail.iteration_files = iterationFiles.filter((filename) => filename.includes(".v"));
  }

  return detail;
}

function describeHumanNext(run: RunRecord): string {
  if (run.status === "created") {
    if (run.workflow === "quick") {
      return "Ask the agent to complete brief.md and draft.md for this run.";
    }
    if (run.workflow === "trend") {
      return "Ask the agent to complete trend-brief.md and fit-check.md, then record a fit verdict.";
    }
    return "Ask the agent to complete proposal.md, brief.md, and tasks.md before drafting note-01.";
  }

  return suggestNextStep(run.workflow, run.status).replace("<id>", run.id);
}

function describeAgentNext(
  run: RunRecord,
  refs: ReturnType<typeof workflowReferencePaths>,
): Record<string, unknown> {
  if (run.status === "created") {
    if (run.workflow === "quick") {
      return {
        read: [refs.commands[0], refs.prompts[0], refs.prompts[1], ...refs.specs],
        write: ["brief.md", "draft.md"],
      };
    }
    if (run.workflow === "trend") {
      return {
        read: [refs.commands[0], refs.prompts[0], ...refs.specs],
        write: ["trend-brief.md", "fit-check.md"],
      };
    }
    return {
      read: [refs.commands[0], refs.prompts[0], ...refs.specs],
      write: ["proposal.md", "brief.md", "tasks.md"],
    };
  }

  return {
    read: refs.commands,
    prompts: refs.prompts,
    specs: refs.specs,
  };
}

function buildCampaignAgentMessage(
  nextNote: string,
  action: "draft" | "review" | "publish" | null,
  reason: string | null,
): string {
  const actionLine =
    action === "review"
      ? `这一步先完成 ${nextNote} 的 review，别急着开下一篇。`
      : action === "publish"
        ? `这一步先为 ${nextNote} 生成 publish package，再推进后续篇章。`
        : `这一步先把 ${nextNote} 的 draft 补完整。`;

  const artifactLine =
    action === "review"
      ? `如果 ${nextNote}.review.md 里还有 <placeholder>...</placeholder>，先补完整 review 再继续。`
      : action === "publish"
        ? `如果 ${nextNote} 的 draft 或 review 还有 <placeholder>...</placeholder>，先补完整，再进入 publish。`
        : `如果 ${nextNote} 对应 draft 还有 <placeholder>...</placeholder>，先补完整，再继续下一步。`;

  return [
    `请继续推进 ${nextNote}。`,
    "先读取 .xhsspec/commands/xhs-plan.md、相关 prompts 和当前 campaign 的 proposal.md、brief.md、tasks.md。",
    actionLine,
    reason ? `优先原因：${reason}` : "",
    artifactLine,
  ].filter(Boolean).join(" ");
}
