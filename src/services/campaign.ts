import path from "node:path";

import { createFrontmatter, parseSimpleYaml, pathExists, placeholder, readText, writeText } from "../utils.ts";
import { listFiles } from "./workflow.ts";

const CAMPAIGN_PLACEHOLDER_PATTERNS = [
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

interface CampaignProgress {
  noteIds: string[];
  draftFiles: string[];
  reviewFiles: string[];
  publishedNotes: string[];
  publishedEntries: CampaignPublishEntry[];
  board: string[];
  status: "briefing" | "drafting" | "reviewing" | "iterating" | "ready";
  nextNote: string | null;
  nextNoteReason: string | null;
  nextAction: "draft" | "review" | "publish" | null;
  completeDraftNotes: string[];
  completeReviewNotes: string[];
}

interface CampaignPublishEntry {
  noteId: string;
  publishDate: string;
  title: string;
  dir: string;
}

export async function syncCampaignMetadata(campaignPath: string, updatedAt: string): Promise<void> {
  const progress = await collectCampaignProgress(campaignPath);
  const tasksPath = path.join(campaignPath, "tasks.md");

  if (await pathExists(tasksPath)) {
    const existing = await readText(tasksPath);
    const strategySection = extractSection(existing, "## Note Strategy", "## Execution Board")
      ?? buildCampaignStrategySection(progress.noteIds);
    const taskBody = [
      "# Tasks",
      "",
      strategySection,
      "",
      "## Execution Board",
      "",
      ...buildCampaignTaskLines(progress.noteIds, progress.draftFiles, progress.reviewFiles, progress.publishedNotes),
      "- [ ] Retrospective",
    ].join("\n");
    await writeText(
      tasksPath,
      createFrontmatter(
        {
          id: `${path.basename(campaignPath)}-tasks`,
          workflow: "campaign",
          status: progress.status,
          updated_at: updatedAt,
        },
        taskBody,
      ),
    );
  }

  const campaignMetaPath = path.join(campaignPath, "campaign.yaml");
  if (await pathExists(campaignMetaPath)) {
    const raw = await readText(campaignMetaPath);
    const next = raw
      .replace(/^status:\s*.*$/mu, `status: ${progress.status}`)
      .replace(/^actual_note_count:\s*.*$/mu, `actual_note_count: ${countUniqueCampaignNotes(progress.draftFiles)}`)
      .replace(/^updated_at:\s*.*$/mu, `updated_at: ${updatedAt}`);
    await writeText(campaignMetaPath, next.endsWith("\n") ? next : `${next}\n`);
  }
}

function buildCampaignTaskLines(
  noteIds: string[],
  draftFiles: string[],
  reviewFiles: string[],
  publishedNotes: string[],
): string[] {
  return noteIds.flatMap((noteId) => {
    const hasDraft = draftFiles.some((file) => extractCampaignNoteId(file) === noteId);
    const hasReview = reviewFiles.some((file) => extractCampaignNoteId(file) === noteId);
    const hasPublish = publishedNotes.includes(noteId);
    return [
      `- [${hasDraft ? "x" : " "}] ${noteId} draft`,
      `- [${hasReview ? "x" : " "}] ${noteId} review`,
      `- [${hasPublish ? "x" : " "}] ${noteId} publish`,
      `- [ ] ${noteId} rewrite if needed`,
    ];
  });
}

function buildCampaignStrategySection(noteIds: string[]): string {
  return [
    "## Note Strategy",
    "",
    ...noteIds.flatMap((noteId) => [
      `### ${noteId}`,
      `- Role: ${placeholder("补充该篇在系列中的角色")}`,
      `- Angle hypothesis: ${placeholder("补充该篇要验证的角度")}`,
      `- Publish purpose: ${placeholder("补充该篇的收藏/评论/转化目标")}`,
      "",
    ]),
  ].join("\n").trimEnd();
}

function collectCampaignNoteIds(draftFiles: string[], reviewFiles: string[], plannedCount: number): string[] {
  const notes = new Set<string>();
  for (const file of draftFiles) {
    notes.add(extractCampaignNoteId(file));
  }
  for (const file of reviewFiles) {
    notes.add(extractCampaignNoteId(file));
  }
  for (let index = 1; index <= plannedCount; index += 1) {
    notes.add(`note-${String(index).padStart(2, "0")}`);
  }
  if (notes.size === 0) {
    notes.add("note-01");
  }
  return [...notes].sort();
}

async function getPlannedNoteCount(campaignPath: string): Promise<number> {
  const campaignMetaPath = path.join(campaignPath, "campaign.yaml");
  if (!(await pathExists(campaignMetaPath))) {
    return 1;
  }

  const meta = parseSimpleYaml(await readText(campaignMetaPath));
  const count = Number(meta.planned_note_count ?? "1");
  return Number.isFinite(count) && count > 0 ? count : 1;
}

function extractSection(content: string, startHeading: string, endHeading: string): string | null {
  const startIndex = content.indexOf(startHeading);
  if (startIndex === -1) {
    return null;
  }

  const endIndex = content.indexOf(endHeading, startIndex + startHeading.length);
  if (endIndex === -1) {
    return content.slice(startIndex).trimEnd();
  }

  return content.slice(startIndex, endIndex).trimEnd();
}

function extractCampaignNoteId(filename: string): string {
  return filename.replace(/\.review\.md$/u, "").replace(/\.v\d+\.md$/u, "").replace(/\.md$/u, "");
}

function countUniqueCampaignNotes(draftFiles: string[]): number {
  return new Set(draftFiles.map((file) => extractCampaignNoteId(file))).size;
}

export async function describeCampaignBoard(campaignPath: string): Promise<string[]> {
  return (await collectCampaignProgress(campaignPath)).board;
}

export async function describeCampaignBoardSummary(campaignPath: string): Promise<string[]> {
  const progress = await collectCampaignProgress(campaignPath);
  const summary = [
    `planned notes: ${progress.noteIds.length}`,
    `published notes: ${progress.publishedNotes.length}`,
  ];

  const latestPublish = progress.publishedEntries.at(-1);
  if (latestPublish) {
    summary.push(`latest publish: ${latestPublish.publishDate} / ${latestPublish.noteId}`);
  }

  if (progress.nextNote) {
    summary.push(`recommended next note: ${progress.nextNote}`);
    if (progress.nextNoteReason) {
      summary.push(`why next: ${progress.nextNoteReason}`);
    }
  }

  return summary;
}

export async function recommendNextCampaignNote(campaignPath: string): Promise<string | null> {
  return (await collectCampaignProgress(campaignPath)).nextNote;
}

export async function explainNextCampaignNote(campaignPath: string): Promise<string | null> {
  return (await collectCampaignProgress(campaignPath)).nextNoteReason;
}

export async function describeNextCampaignAction(campaignPath: string): Promise<"draft" | "review" | "publish" | null> {
  return (await collectCampaignProgress(campaignPath)).nextAction;
}

export async function describeCampaignPublishTimeline(campaignPath: string): Promise<string[]> {
  const progress = await collectCampaignProgress(campaignPath);
  return progress.publishedEntries.map((entry) => `${entry.publishDate}: ${entry.noteId} (${entry.title})`);
}

async function collectCampaignProgress(campaignPath: string): Promise<CampaignProgress> {
  const draftFiles = await listFiles(path.join(campaignPath, "drafts"), ".md");
  const reviewFiles = await listFiles(path.join(campaignPath, "reviews"), ".md");
  const noteIds = collectCampaignNoteIds(draftFiles, reviewFiles, await getPlannedNoteCount(campaignPath));
  const publishedEntries = await listPublishedCampaignEntries(resolveRepoRootFromCampaignPath(campaignPath), path.basename(campaignPath));
  const publishedNotes = publishedEntries.map((entry) => entry.noteId);
  const completeDraftNotes = await findCompleteDraftNotes(campaignPath, noteIds);
  const completeReviewNotes = await findCompleteReviewNotes(campaignPath, noteIds);
  const nextNoteDecision = recommendNextNote(noteIds, draftFiles, reviewFiles, publishedNotes, completeDraftNotes, completeReviewNotes);

  return {
    noteIds,
    draftFiles,
    reviewFiles,
    publishedNotes,
    publishedEntries,
    completeDraftNotes,
    completeReviewNotes,
    board: noteIds.map((noteId) => {
      const hasDraft = draftFiles.some((file) => extractCampaignNoteId(file) === noteId);
      const hasReview = reviewFiles.some((file) => extractCampaignNoteId(file) === noteId);
      const hasPublish = publishedNotes.includes(noteId);
      const draftState = completeDraftNotes.includes(noteId) ? "draft" : hasDraft ? "drafting" : "todo";
      const reviewState = completeReviewNotes.includes(noteId) ? "review" : hasReview ? "reviewing" : "todo";
      const publishState = hasPublish ? "published" : "todo";
      return `${noteId}: ${draftState} / ${reviewState} / ${publishState}`;
    }),
    status: deriveCampaignStatus(noteIds, draftFiles, reviewFiles, publishedNotes, completeReviewNotes),
    nextNote: nextNoteDecision.noteId,
    nextNoteReason: nextNoteDecision.reason,
    nextAction: nextNoteDecision.action,
  };
}

function deriveCampaignStatus(
  noteIds: string[],
  draftFiles: string[],
  reviewFiles: string[],
  publishedNotes: string[],
  completeReviewNotes: string[],
): "briefing" | "drafting" | "reviewing" | "iterating" | "ready" {
  if (noteIds.length > 0 && noteIds.every((noteId) => publishedNotes.includes(noteId))) {
    return "ready";
  }

  if (draftFiles.some((file) => /\.v\d+\.md$/u.test(file))) {
    return "iterating";
  }

  if (reviewFiles.length > 0 || publishedNotes.length > 0 || completeReviewNotes.length > 0) {
    return "reviewing";
  }

  if (draftFiles.length > 0) {
    return "drafting";
  }

  return "briefing";
}

function recommendNextNote(
  noteIds: string[],
  draftFiles: string[],
  reviewFiles: string[],
  publishedNotes: string[],
  completeDraftNotes: string[],
  completeReviewNotes: string[],
): { noteId: string | null; action: "draft" | "review" | "publish" | null; reason: string | null } {
  for (const noteId of noteIds) {
    const hasDraft = draftFiles.some((file) => extractCampaignNoteId(file) === noteId);
    const hasReview = reviewFiles.some((file) => extractCampaignNoteId(file) === noteId);
    const hasCompleteDraft = completeDraftNotes.includes(noteId);
    const hasCompleteReview = completeReviewNotes.includes(noteId);
    if (hasDraft && hasCompleteDraft && !hasCompleteReview) {
      return {
        noteId,
        action: "review",
        reason: hasReview
          ? `${noteId} 已有 review artifact，但审稿还没完成，先把这一篇收紧再开下一篇更稳。`
          : `${noteId} 已有草稿但还没有 review，先把这一篇收紧再开下一篇更稳。`,
      };
    }
  }

  for (const noteId of noteIds) {
    const hasDraft = draftFiles.some((file) => extractCampaignNoteId(file) === noteId);
    const hasCompleteDraft = completeDraftNotes.includes(noteId);
    if (!hasCompleteDraft) {
      return {
        noteId,
        action: "draft",
        reason: hasDraft
          ? `${noteId} 已有 draft artifact，但内容还没完成，先把这一篇补完整。`
          : `${noteId} 还没有首稿，继续推进它能让系列保持顺序展开。`,
      };
    }
  }

  for (const noteId of noteIds) {
    if (!publishedNotes.includes(noteId)) {
      return {
        noteId,
        action: "publish",
        reason: `${noteId} 已经写完并审过，但还没发布，适合进入发布节奏。`,
      };
    }
  }

  return { noteId: null, action: null, reason: null };
}

async function findCompleteDraftNotes(campaignPath: string, noteIds: string[]): Promise<string[]> {
  const completed: string[] = [];
  for (const noteId of noteIds) {
    const draftPath = await resolveLatestCampaignDraftForProgress(campaignPath, noteId);
    if (!draftPath) {
      continue;
    }

    const issues = await inspectCampaignArtifactCompleteness(draftPath);
    if (issues.length === 0) {
      completed.push(noteId);
    }
  }
  return completed;
}

async function findCompleteReviewNotes(campaignPath: string, noteIds: string[]): Promise<string[]> {
  const completed: string[] = [];
  for (const noteId of noteIds) {
    const reviewPath = path.join(campaignPath, "reviews", `${noteId}.review.md`);
    if (!(await pathExists(reviewPath))) {
      continue;
    }

    const issues = await inspectCampaignArtifactCompleteness(reviewPath);
    if (issues.length === 0) {
      completed.push(noteId);
    }
  }
  return completed;
}

async function resolveLatestCampaignDraftForProgress(campaignPath: string, noteId: string): Promise<string | null> {
  const draftsDir = path.join(campaignPath, "drafts");
  const draftFiles = await listFiles(draftsDir, ".md");
  const matching = draftFiles
    .filter((filename) => filename === `${noteId}.md` || new RegExp(`^${escapeRegex(noteId)}\\.v\\d+\\.md$`, "u").test(filename))
    .sort();

  if (matching.length === 0) {
    return null;
  }

  return path.join(draftsDir, matching.at(-1)!);
}

async function inspectCampaignArtifactCompleteness(filePath: string): Promise<string[]> {
  if (!(await pathExists(filePath))) {
    return ["missing file"];
  }

  const content = await readText(filePath);
  const body = content.replace(/^---[\s\S]*?---\n?/u, "");
  const issues: string[] = [];

  for (const pattern of CAMPAIGN_PLACEHOLDER_PATTERNS) {
    if (pattern.test(body)) {
      issues.push(`contains placeholder content (${pattern.source})`);
      break;
    }
  }

  return issues;
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function resolveRepoRootFromCampaignPath(campaignPath: string): string {
  return path.dirname(path.dirname(path.dirname(campaignPath)));
}

async function listPublishedCampaignEntries(repoRoot: string, campaignId: string): Promise<CampaignPublishEntry[]> {
  const publishRoot = path.join(repoRoot, "publish");
  if (!(await pathExists(publishRoot))) {
    return [];
  }

  const fs = await import("node:fs/promises");
  const entries: CampaignPublishEntry[] = [];
  const dateDirs = await fs.readdir(publishRoot, { withFileTypes: true });

  for (const dateDir of dateDirs) {
    if (!dateDir.isDirectory()) {
      continue;
    }

    const datePath = path.join(publishRoot, dateDir.name);
    const packageDirs = await fs.readdir(datePath, { withFileTypes: true });
    for (const packageDir of packageDirs) {
      if (!packageDir.isDirectory()) {
        continue;
      }

      const metaPath = path.join(datePath, packageDir.name, "post-meta.yaml");
      if (!(await pathExists(metaPath))) {
        continue;
      }

      const meta = parseSimpleYaml(await readText(metaPath));
      if (String(meta.run_id ?? "") !== campaignId) {
        continue;
      }

      const noteId = String(meta.note_id ?? "");
      if (noteId) {
        entries.push({
          noteId,
          publishDate: String(meta.publish_date ?? dateDir.name),
          title: String(meta.title ?? packageDir.name),
          dir: path.join("publish", dateDir.name, packageDir.name),
        });
      }
    }
  }

  return entries.sort((left, right) => {
    const dateCompare = left.publishDate.localeCompare(right.publishDate);
    if (dateCompare !== 0) {
      return dateCompare;
    }

    return left.noteId.localeCompare(right.noteId);
  });
}
