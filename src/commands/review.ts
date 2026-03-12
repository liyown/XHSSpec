import path from "node:path";

import type { CommandContext } from "../types.ts";
import { ensureRepo } from "../lib/context.ts";
import { latestRun, resolveRun, suggestNextStep, workflowReferencePaths } from "../repo.ts";
import { syncCampaignMetadata } from "../services/campaign.ts";
import { assertReadyForReview } from "../services/completeness.ts";
import { canReview, updateRunStatus } from "../services/workflow.ts";
import { createFrontmatter, getStringArg, placeholder, toIsoNow, writeText } from "../utils.ts";

export async function reviewCommand(context: CommandContext): Promise<void> {
  await ensureRepo(context.repoRoot);
  const targetId = getStringArg(context.args, "target") ?? (await latestRun(context.repoRoot))?.id;
  if (!targetId) {
    throw new Error("review requires --target or an existing latest run");
  }

  const run = await resolveRun(context.repoRoot, targetId);
  if (!run) {
    throw new Error(`Unknown target: ${targetId}`);
  }
  if (!canReview(run)) {
    throw new Error(`Run ${run.id} is in status ${run.status} and cannot be reviewed yet.`);
  }

  const mode = getStringArg(context.args, "mode") ?? (run.workflow === "quick" ? "light" : "standard");
  const now = toIsoNow();
  const noteId = run.workflow === "campaign" ? getStringArg(context.args, "note") ?? "note-01" : undefined;
  await assertReadyForReview(run, noteId);
  const reviewPath = run.workflow === "campaign" ? path.join(run.path, "reviews", `${noteId}.review.md`) : path.join(run.path, "review.md");
  const reviewTarget = noteId ? `${run.id}/${noteId}` : run.id;

  await writeText(
    reviewPath,
    createFrontmatter(
      {
        id: noteId ? `${run.id}-${noteId}-review` : `${run.id}-review`,
        workflow: run.workflow,
        status: "reviewed",
        mode,
        note_id: noteId ?? "",
        updated_at: now,
      },
      [
        "# Review",
        "",
        `- Mode: ${mode}`,
        `- Target: ${reviewTarget}`,
        "",
        "## Verdict",
        "- fix",
        "",
        "## Strengths",
        `- What is already working: ${placeholder("分析当前稿件已成立的部分")}`,
        "",
        "## Issues",
        "- Highest-priority issue: Hook strength",
        "- Secondary issue: Brand alignment",
        `- CTA clarity: ${placeholder("判断 CTA 是否清晰")}`,
        `- Taboo compliance: ${placeholder("判断是否触碰 taboo")}`,
        `- Structural clarity: ${placeholder("判断结构是否清晰")}`,
        "",
        "## Rewrite Guidance",
        `- What to change first: ${placeholder("给出第一优先级改写动作")}`,
        `- What to preserve: ${placeholder("指出需要保留的部分")}`,
      ].join("\n"),
    ),
  );

  await updateRunStatus(run, "reviewed", now);
  if (run.workflow === "campaign") {
    await syncCampaignMetadata(run.path, now);
  }

  console.log(`Created review artifact for ${reviewTarget}`);
  console.log(reviewPath);
  const refs = workflowReferencePaths(context.repoRoot, run.workflow);
  console.log(`Read with agent: ${refs.commands.find((ref) => ref.endsWith("xhs-review.md")) ?? refs.commands[0]}`);
  console.log(`Specs: ${refs.specs.join(", ")}`);
  console.log(`Prompts: ${refs.prompts.join(", ")}`);
  console.log(`Next: ${suggestNextStep(run.workflow, "reviewed").replace("<id>", run.id)}`);
}
