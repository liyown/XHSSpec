import path from "node:path";

import type { CommandContext } from "../types.ts";
import { ensureRepo } from "../lib/context.ts";
import { latestRun, resolveRun } from "../repo.ts";
import { syncCampaignMetadata } from "../services/campaign.ts";
import { assertReadyForIterate } from "../services/completeness.ts";
import { resolveCampaignDraftPath, updateRunStatus, writeIterationDraft } from "../services/workflow.ts";
import { createFrontmatter, getStringArg, pathExists, placeholder, readText, toIsoNow } from "../utils.ts";

export async function iterateCommand(context: CommandContext): Promise<void> {
  await ensureRepo(context.repoRoot);
  const targetId = getStringArg(context.args, "target") ?? (await latestRun(context.repoRoot))?.id;
  if (!targetId) {
    throw new Error("iterate requires --target or an existing latest run");
  }

  const run = await resolveRun(context.repoRoot, targetId);
  if (!run) {
    throw new Error(`Unknown target: ${targetId}`);
  }

  const round = Number(getStringArg(context.args, "round") ?? "2");
  const now = toIsoNow();

  if (run.workflow === "campaign") {
    const noteId = getStringArg(context.args, "note") ?? "note-01";
    await assertReadyForIterate(run, noteId);
    const previousDraftPath = resolveCampaignDraftPath(run.path, noteId, round - 1);
    const nextDraftPath = resolveCampaignDraftPath(run.path, noteId, round);
    const sourceBody = (await pathExists(previousDraftPath))
      ? await readText(previousDraftPath)
      : createFrontmatter(
          {
            id: `${run.id}-${noteId}-v${round}`,
            workflow: "campaign",
            status: "iterating",
            note_id: noteId,
            version: String(round),
            updated_at: now,
          },
          `# Campaign Note Draft\n\n## Hook\n- ${placeholder("补充新的 hook 方向")}\n`,
        );
    await writeIterationDraft(nextDraftPath, sourceBody, now, round, noteId);
    await updateRunStatus(run, "iterating", now);
    await syncCampaignMetadata(run.path, now);

    console.log(`Prepared campaign iteration: ${run.id}/${noteId} v${round}`);
    console.log(nextDraftPath);
    console.log(`Next: /xhs:rewrite or xhs-spec review --target ${run.id} --note ${noteId}`);
    return;
  }

  await assertReadyForIterate(run);
  const previousDraftPath = path.join(run.path, "draft.md");
  const nextDraftPath = path.join(run.path, `draft.v${round}.md`);
  const sourceBody = await readText(previousDraftPath);
  await writeIterationDraft(nextDraftPath, sourceBody, now, round);
  await updateRunStatus(run, "iterating", now);

  console.log(`Prepared iteration draft for ${run.id} v${round}`);
  console.log(nextDraftPath);
  console.log(`Next: /xhs:rewrite or xhs-spec review --target ${run.id}`);
}
