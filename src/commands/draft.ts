import path from "node:path";

import type { CommandContext } from "../types.ts";
import { ensureRepo } from "../lib/context.ts";
import { latestRun, resolveRun } from "../repo.ts";
import { syncCampaignMetadata } from "../services/campaign.ts";
import { assertReadyForDraft } from "../services/completeness.ts";
import { updateRunStatus } from "../services/workflow.ts";
import { createFrontmatter, getStringArg, placeholder, toIsoNow, writeText } from "../utils.ts";

export async function draftCommand(context: CommandContext): Promise<void> {
  await ensureRepo(context.repoRoot);
  const targetId = getStringArg(context.args, "target") ?? (await latestRun(context.repoRoot))?.id;
  if (!targetId) {
    throw new Error("draft requires --target or an existing latest run");
  }

  const run = await resolveRun(context.repoRoot, targetId);
  if (!run) {
    throw new Error(`Unknown target: ${targetId}`);
  }

  const now = toIsoNow();

  if (run.workflow === "campaign") {
    const noteId = getStringArg(context.args, "note") ?? "note-01";
    await assertReadyForDraft(run, noteId);
    const draftPath = path.join(run.path, "drafts", `${noteId}.md`);
    await writeText(
      draftPath,
      createFrontmatter(
        {
          id: `${run.id}-${noteId}`,
          workflow: "campaign",
          status: "drafting",
          note_id: noteId,
          updated_at: now,
        },
        [
          "# Campaign Note Draft",
          "",
          `- Campaign: ${run.id}`,
          `- Note: ${noteId}`,
          "",
          "## Hook",
          `- Option 1: ${placeholder("生成 hook 方案 1")}`,
          `- Option 2: ${placeholder("生成 hook 方案 2")}`,
          "",
          "## Body",
          "",
          "### Problem or context",
          `- ${placeholder("补充问题或场景")}`,
          "",
          "### Insight or method",
          `- ${placeholder("补充方法或洞察")}`,
          "",
          "### Concrete takeaway",
          `- ${placeholder("补充具体收获")}`,
          "",
          "### Closing turn",
          `- ${placeholder("补充结尾转折")}`,
          "",
          "## CTA",
          `- Primary CTA: ${placeholder("补充主 CTA")}`,
          `- Why this CTA fits: ${placeholder("说明 CTA 与品牌匹配原因")}`,
        ].join("\n"),
      ),
    );
    await updateRunStatus(run, "drafting", now);
    await syncCampaignMetadata(run.path, now);

    console.log(`Prepared campaign draft: ${run.id} / ${noteId}`);
    console.log(draftPath);
    console.log(`Next: /xhs:draft or xhs-spec review --target ${run.id}`);
    return;
  }

  if (run.workflow === "trend") {
    await assertReadyForDraft(run);
  }

  await updateRunStatus(run, "drafting", now);
  console.log(`${run.workflow === "trend" ? "Trend" : "Quick"} run ${run.id} is ready for drafting.`);
  console.log(path.join(run.path, "draft.md"));
  console.log(`Next: ${run.workflow === "trend" ? "/xhs:draft or xhs-spec review --target " : "/xhs:quick or xhs-spec review --target "}${run.id}`);
}
