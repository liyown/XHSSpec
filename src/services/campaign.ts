import path from "node:path";

import { createFrontmatter, pathExists, readText, writeText } from "../utils.ts";
import { listFiles } from "./workflow.ts";

export async function syncCampaignMetadata(campaignPath: string, updatedAt: string): Promise<void> {
  const draftFiles = await listFiles(path.join(campaignPath, "drafts"), ".md");
  const reviewFiles = await listFiles(path.join(campaignPath, "reviews"), ".md");
  const tasksPath = path.join(campaignPath, "tasks.md");

  if (await pathExists(tasksPath)) {
    const taskBody = ["# Tasks", "", ...buildCampaignTaskLines(draftFiles, reviewFiles), "- [ ] Retrospective"].join("\n");
    await writeText(
      tasksPath,
      createFrontmatter(
        {
          id: `${path.basename(campaignPath)}-tasks`,
          workflow: "campaign",
          status: reviewFiles.length > 0 ? "reviewing" : "briefing",
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
      .replace(/^actual_note_count:\s*.*$/mu, `actual_note_count: ${countUniqueCampaignNotes(draftFiles)}`)
      .replace(/^updated_at:\s*.*$/mu, `updated_at: ${updatedAt}`);
    await writeText(campaignMetaPath, next.endsWith("\n") ? next : `${next}\n`);
  }
}

function buildCampaignTaskLines(draftFiles: string[], reviewFiles: string[]): string[] {
  const notes = new Set<string>();
  for (const file of draftFiles) {
    notes.add(extractCampaignNoteId(file));
  }
  for (const file of reviewFiles) {
    notes.add(extractCampaignNoteId(file));
  }

  if (notes.size === 0) {
    notes.add("note-01");
  }

  return [...notes].sort().flatMap((noteId) => {
    const hasDraft = draftFiles.some((file) => extractCampaignNoteId(file) === noteId);
    const hasReview = reviewFiles.some((file) => extractCampaignNoteId(file) === noteId);
    return [
      `- [${hasDraft ? "x" : " "}] ${noteId} draft`,
      `- [${hasReview ? "x" : " "}] ${noteId} review`,
      `- [ ] ${noteId} rewrite if needed`,
    ];
  });
}

function extractCampaignNoteId(filename: string): string {
  return filename.replace(/\.review\.md$/u, "").replace(/\.v\d+\.md$/u, "").replace(/\.md$/u, "");
}

function countUniqueCampaignNotes(draftFiles: string[]): number {
  return new Set(draftFiles.map((file) => extractCampaignNoteId(file))).size;
}
