import type { CommandContext } from "../types.ts";
import { ensureRepo } from "../lib/context.ts";
import { latestRun, resolveRun, workflowReferencePaths } from "../repo.ts";
import { syncCampaignMetadata } from "../services/campaign.ts";
import { assertReadyForPublish } from "../services/completeness.ts";
import { buildPublishPackage } from "../services/publish.ts";
import { canPublish, updateRunStatus } from "../services/workflow.ts";
import { formatDate, getStringArg, toIsoNow } from "../utils.ts";

export async function publishCommand(context: CommandContext): Promise<void> {
  await ensureRepo(context.repoRoot);
  const targetId = getStringArg(context.args, "target") ?? (await latestRun(context.repoRoot))?.id;
  if (!targetId) {
    throw new Error("publish requires --target or an existing latest run");
  }

  const run = await resolveRun(context.repoRoot, targetId);
  if (!run) {
    throw new Error(`Unknown target: ${targetId}`);
  }
  if (!canPublish(run)) {
    throw new Error(`Run ${run.id} is in status ${run.status} and cannot be published yet.`);
  }

  const noteId = run.workflow === "campaign" ? getStringArg(context.args, "note") ?? "note-01" : undefined;
  await assertReadyForPublish(run, noteId);

  const publishDate = getStringArg(context.args, "date") ?? new Date().toISOString().slice(0, 10);
  const titleOverride = getStringArg(context.args, "title");
  const packageInfo = await buildPublishPackage(context.repoRoot, run, {
    noteId,
    publishDate,
    titleOverride,
  });

  const nextStatus = run.workflow === "campaign" ? "ready" : "done";
  const now = toIsoNow();
  await updateRunStatus(run, nextStatus, now);
  if (run.workflow === "campaign") {
    await syncCampaignMetadata(run.path, now);
  }

  console.log(`Created publish package for ${run.id}`);
  console.log(packageInfo.dir);
  console.log(packageInfo.notePath);
  console.log(packageInfo.coverBriefPath);
  console.log(packageInfo.assetsPath);
  console.log(packageInfo.demoPath);
  console.log(packageInfo.guidePath);
  const refs = workflowReferencePaths(context.repoRoot, run.workflow);
  console.log(`Read with agent: ${refs.commands.find((ref) => ref.endsWith("xhs-publish.md")) ?? refs.commands[0]}`);
  console.log(`Specs: ${refs.specs.join(", ")}`);
  console.log(`Prompts: ${refs.prompts.join(", ")}`);
  console.log(`Next: xhs-spec archive --target ${run.id}${noteId ? ` --note ${noteId}` : ""}`);
}
