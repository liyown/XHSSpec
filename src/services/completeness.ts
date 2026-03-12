import path from "node:path";

import type { RunRecord, ValidationIssue } from "../types.ts";
import { pathExists, readText } from "../utils.ts";
import { listFiles, resolveCampaignDraftPath } from "./workflow.ts";

const PLACEHOLDER_PATTERNS = [
  /<placeholder>[\s\S]*?<\/placeholder>/u,
  /<placehold>[\s\S]*?<placehold\/>/u,
  /待补充/u,
  /待 agent/u,
  /待判断/u,
  /待从/u,
  /pending/u,
  /\[X\]/u,
  /\[具体任务\]/u,
  /\[其他技术\]/u,
  /\[一句话描述\]/u,
];

const BRAND_READY_FILES = [
  "brand/profile.md",
  "brand/audience.md",
  "brand/offer.md",
  "brand/tone.md",
  "brand/taboo.md",
] as const;

export interface CompletenessIssue {
  filePath: string;
  reason: string;
}

interface CompletenessRequirement {
  filePath: string;
  reason: string;
}

export async function assertReadyForDraft(run: RunRecord, noteId?: string): Promise<void> {
  const issues: CompletenessIssue[] = [];

  if (run.workflow === "trend") {
    if (run.status !== "fit-approved" && run.status !== "drafting" && run.status !== "reviewed") {
      throw new Error(`Cannot proceed to draft because ${run.id} is not fit-approved yet. Run xhsops fit first.`);
    }
    issues.push(...(await inspectMarkdownCompleteness(path.join(run.path, "trend-brief.md"))));
    issues.push(...(await inspectMarkdownCompleteness(path.join(run.path, "fit-check.md"))));
  }

  if (run.workflow === "campaign") {
    issues.push(...(await inspectMarkdownCompleteness(path.join(run.path, "proposal.md"))));
    issues.push(...(await inspectMarkdownCompleteness(path.join(run.path, "brief.md"))));
    issues.push(...(await inspectMarkdownCompleteness(path.join(run.path, "tasks.md"))));
  }

  if (issues.length > 0) {
    throw new Error(buildCompletenessError("draft", issues));
  }
}

export async function assertBrandReadyForCreation(repoRoot: string): Promise<void> {
  const issues = await inspectBrandReadiness(repoRoot);
  if (issues.length > 0) {
    const lines = issues.map((issue) => `- ${issue.filePath}: ${issue.reason}`).join("\n");
    throw new Error(
      `Cannot start content creation because brand positioning is incomplete:\n${lines}\nFinish the brand files first, then continue creation. You can still refine them during creation.`,
    );
  }
}

export async function assertTrendFitCheckComplete(run: RunRecord): Promise<void> {
  const issues = await inspectMarkdownCompleteness(path.join(run.path, "fit-check.md"));
  if (issues.length > 0) {
    throw new Error(buildCompletenessError("fit approval", issues));
  }
}

export async function assertReadyForReview(run: RunRecord, noteId?: string): Promise<void> {
  const targetPath =
    run.workflow === "campaign"
      ? await resolveLatestCampaignDraft(run.path, noteId ?? "note-01")
      : await resolveLatestLinearDraft(run.path);

  const issues = await inspectMarkdownCompleteness(targetPath);
  if (issues.length > 0) {
    throw new Error(buildCompletenessError("review", issues));
  }
}

export async function assertReadyForIterate(run: RunRecord, noteId?: string): Promise<void> {
  const reviewPath =
    run.workflow === "campaign"
      ? path.join(run.path, "reviews", `${noteId ?? "note-01"}.review.md`)
      : path.join(run.path, "review.md");

  const issues = await inspectMarkdownCompleteness(reviewPath);
  if (issues.length > 0) {
    throw new Error(buildCompletenessError("iteration", issues));
  }
}

export async function assertReadyForArchive(run: RunRecord, noteId?: string): Promise<void> {
  const issues: CompletenessIssue[] = [];

  if (run.workflow === "trend" && (run.status === "fit-rejected" || run.status === "dropped")) {
    issues.push(...(await inspectMarkdownCompleteness(path.join(run.path, "fit-check.md"))));
  } else {
    const draftPath =
      run.workflow === "campaign"
        ? await resolveLatestCampaignDraft(run.path, noteId ?? "note-01")
        : await resolveLatestLinearDraft(run.path);
    const reviewPath =
      run.workflow === "campaign"
        ? path.join(run.path, "reviews", `${noteId ?? "note-01"}.review.md`)
        : path.join(run.path, "review.md");

    issues.push(...(await inspectMarkdownCompleteness(draftPath)));
    issues.push(...(await inspectMarkdownCompleteness(reviewPath)));
  }

  if (issues.length > 0) {
    throw new Error(buildCompletenessError("archive", issues));
  }
}

export async function assertReadyForPublish(run: RunRecord, noteId?: string): Promise<void> {
  if (run.workflow === "trend" && (run.status === "fit-rejected" || run.status === "dropped")) {
    throw new Error(`Cannot publish ${run.id} because this trend was dropped at fit-check.`);
  }

  const draftPath =
    run.workflow === "campaign"
      ? await resolveLatestCampaignDraft(run.path, noteId ?? "note-01")
      : await resolveLatestLinearDraft(run.path);
  const reviewPath =
    run.workflow === "campaign"
      ? path.join(run.path, "reviews", `${noteId ?? "note-01"}.review.md`)
      : path.join(run.path, "review.md");

  const issues = [
    ...(await inspectMarkdownCompleteness(draftPath)),
    ...(await inspectMarkdownCompleteness(reviewPath)),
  ];

  if (issues.length > 0) {
    throw new Error(buildCompletenessError("publish", issues));
  }
}

export async function collectRunCompletenessIssues(run: RunRecord): Promise<CompletenessIssue[]> {
  const issues: CompletenessIssue[] = [];
  if (run.workflow === "quick") {
    issues.push(...(await inspectIfExists(path.join(run.path, "brief.md"))));
    issues.push(...(await inspectIfExists(await resolveLatestLinearDraft(run.path))));
    issues.push(...(await inspectIfExists(path.join(run.path, "review.md"))));
    issues.push(...(await inspectIfExists(path.join(run.path, "retrospective.md"))));
    return issues;
  }

  if (run.workflow === "trend") {
    issues.push(...(await inspectIfExists(path.join(run.path, "trend-brief.md"))));
    issues.push(...(await inspectIfExists(path.join(run.path, "fit-check.md"))));
    issues.push(...(await inspectIfExists(await resolveLatestLinearDraft(run.path))));
    issues.push(...(await inspectIfExists(path.join(run.path, "review.md"))));
    issues.push(...(await inspectIfExists(path.join(run.path, "retrospective.md"))));
    return issues;
  }

  issues.push(...(await inspectIfExists(path.join(run.path, "proposal.md"))));
  issues.push(...(await inspectIfExists(path.join(run.path, "brief.md"))));
  issues.push(...(await inspectIfExists(path.join(run.path, "tasks.md"))));
  issues.push(...(await inspectCampaignDrafts(run.path)));
  issues.push(...(await inspectCampaignReviews(run.path)));
  issues.push(...(await inspectIfExists(path.join(run.path, "retrospective.md"))));
  return issues;
}

export async function completenessIssuesForValidation(run: RunRecord): Promise<ValidationIssue[]> {
  const requirements = await requiredCompleteFilesForStatus(run);
  const issues: ValidationIssue[] = [];

  for (const requirement of requirements) {
    const fileIssues = await inspectMarkdownCompleteness(requirement.filePath);
    for (const issue of fileIssues) {
      issues.push({ level: "error", path: issue.filePath, message: requirement.reason });
    }
  }

  return dedupeValidationIssues(issues);
}

export async function brandIssuesForValidation(repoRoot: string): Promise<ValidationIssue[]> {
  const issues = await inspectBrandReadiness(repoRoot);
  return issues.map((issue) => ({
    level: "error" as const,
    path: issue.filePath,
    message: "Brand positioning must be complete before content creation",
  }));
}

async function inspectCampaignDrafts(runPath: string): Promise<CompletenessIssue[]> {
  const files = await listFiles(path.join(runPath, "drafts"), ".md");
  const issues: CompletenessIssue[] = [];
  for (const filename of files) {
    issues.push(...(await inspectMarkdownCompleteness(path.join(runPath, "drafts", filename))));
  }
  return issues;
}

async function inspectCampaignReviews(runPath: string): Promise<CompletenessIssue[]> {
  const files = await listFiles(path.join(runPath, "reviews"), ".md");
  const issues: CompletenessIssue[] = [];
  for (const filename of files) {
    issues.push(...(await inspectMarkdownCompleteness(path.join(runPath, "reviews", filename))));
  }
  return issues;
}

async function inspectIfExists(filePath: string): Promise<CompletenessIssue[]> {
  if (!(await pathExists(filePath))) {
    return [];
  }

  return inspectMarkdownCompleteness(filePath);
}

async function inspectBrandReadiness(repoRoot: string): Promise<CompletenessIssue[]> {
  const issues: CompletenessIssue[] = [];
  for (const relativePath of BRAND_READY_FILES) {
    const filePath = path.join(repoRoot, ".xhsops", relativePath);
    const fileIssues = await inspectMarkdownCompleteness(filePath);
    for (const issue of fileIssues) {
      issues.push({ filePath: issue.filePath, reason: "brand positioning file is incomplete" });
    }
  }
  return issues;
}

async function resolveLatestLinearDraft(runPath: string): Promise<string> {
  const draftFiles = await listFiles(runPath, ".md");
  const versions = draftFiles.filter((filename) => /^draft(\.v\d+)?\.md$/u.test(filename)).sort();
  const latest = versions.at(-1) ?? "draft.md";
  return path.join(runPath, latest);
}

async function resolveLatestCampaignDraft(runPath: string, noteId: string): Promise<string> {
  const draftsDir = path.join(runPath, "drafts");
  const draftFiles = await listFiles(draftsDir, ".md");
  const matching = draftFiles
    .filter((filename) => filename === `${noteId}.md` || new RegExp(`^${escapeRegex(noteId)}\\.v\\d+\\.md$`, "u").test(filename))
    .sort();

  if (matching.length === 0) {
    return resolveCampaignDraftPath(runPath, noteId, 1);
  }

  return path.join(draftsDir, matching.at(-1)!);
}

export async function inspectMarkdownCompleteness(filePath: string): Promise<CompletenessIssue[]> {
  if (!(await pathExists(filePath))) {
    return [{ filePath, reason: "missing file" }];
  }

  const content = await readText(filePath);
  const body = content.replace(/^---[\s\S]*?---\n?/u, "");
  const issues: CompletenessIssue[] = [];

  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(body)) {
      issues.push({ filePath, reason: `contains placeholder content (${pattern.source})` });
      break;
    }
  }

  return issues;
}

function buildCompletenessError(stage: string, issues: CompletenessIssue[]): string {
  const lines = issues.map((issue) => `- ${issue.filePath}: ${issue.reason}`).join("\n");
  return `Cannot proceed to ${stage} because the previous artifact is incomplete:\n${lines}\nAsk the agent to finish these files first.`;
}

async function requiredCompleteFilesForStatus(run: RunRecord): Promise<CompletenessRequirement[]> {
  if (run.workflow === "quick") {
    const requirements: CompletenessRequirement[] = [];
    if (["briefed", "drafting", "reviewed", "done", "archived"].includes(run.status)) {
      requirements.push({
        filePath: path.join(run.path, "brief.md"),
        reason: "Brief must be complete before this quick run status",
      });
    }
    if (["reviewed", "done", "archived"].includes(run.status)) {
      requirements.push({
        filePath: await resolveLatestLinearDraft(run.path),
        reason: "Draft must be complete before review/archive stages",
      });
      requirements.push({
        filePath: path.join(run.path, "review.md"),
        reason: "Review must be complete before archive stages",
      });
    }
    return requirements;
  }

  if (run.workflow === "trend") {
    const requirements: CompletenessRequirement[] = [];
    const endedAtFitGate = await trendEndedAtFitGate(run);
    if (["fit-checking", "fit-approved", "fit-rejected", "drafting", "reviewed", "done", "dropped", "archived"].includes(run.status)) {
      requirements.push({
        filePath: path.join(run.path, "trend-brief.md"),
        reason: "Trend brief must be complete before fit-check and downstream stages",
      });
    }
    if (["fit-approved", "fit-rejected", "drafting", "reviewed", "done", "dropped", "archived"].includes(run.status)) {
      requirements.push({
        filePath: path.join(run.path, "fit-check.md"),
        reason: "Fit-check must be complete before fit verdict and downstream stages",
      });
    }
    if (["reviewed", "done"].includes(run.status) || (run.status === "archived" && !endedAtFitGate)) {
      requirements.push({
        filePath: await resolveLatestLinearDraft(run.path),
        reason: "Draft must be complete before review/archive stages",
      });
      requirements.push({
        filePath: path.join(run.path, "review.md"),
        reason: "Review must be complete before archive stages",
      });
    }
    return requirements;
  }

  const requirements: CompletenessRequirement[] = [];
  if (["planned", "briefing", "drafting", "reviewing", "iterating", "ready", "archived"].includes(run.status)) {
    requirements.push(
      {
        filePath: path.join(run.path, "proposal.md"),
        reason: "Campaign proposal must be complete before downstream stages",
      },
      {
        filePath: path.join(run.path, "brief.md"),
        reason: "Campaign brief must be complete before downstream stages",
      },
      {
        filePath: path.join(run.path, "tasks.md"),
        reason: "Campaign tasks must be complete before downstream stages",
      },
    );
  }
  if (["reviewing", "iterating", "ready", "archived"].includes(run.status)) {
    const draftsDir = path.join(run.path, "drafts");
    const draftFiles = await listFiles(draftsDir, ".md");
    for (const filename of draftFiles) {
      requirements.push({
        filePath: path.join(draftsDir, filename),
        reason: "Campaign drafts must be complete before review/archive stages",
      });
    }
  }
  if (["ready", "archived"].includes(run.status)) {
    const reviewsDir = path.join(run.path, "reviews");
    const reviewFiles = await listFiles(reviewsDir, ".md");
    for (const filename of reviewFiles) {
      requirements.push({
        filePath: path.join(reviewsDir, filename),
        reason: "Campaign reviews must be complete before archive stages",
      });
    }
  }
  return requirements;
}

function dedupeValidationIssues(issues: ValidationIssue[]): ValidationIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.level}:${issue.path}:${issue.message}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

async function trendEndedAtFitGate(run: RunRecord): Promise<boolean> {
  const fitCheckPath = path.join(run.path, "fit-check.md");
  if (!(await pathExists(fitCheckPath))) {
    return false;
  }

  const content = await readText(fitCheckPath);
  return /\brejected\b/u.test(content) || /\bdrop(?:ped)?\b/u.test(content);
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
