import path from "node:path";

import type { CommandContext } from "../types.ts";
import { ensureRepo } from "../lib/context.ts";
import { latestRun, resolveRun, suggestNextStep, workflowReferencePaths } from "../repo.ts";
import { assertTrendFitCheckComplete } from "../services/completeness.ts";
import { getStringArg, readText, toIsoNow, writeText } from "../utils.ts";
import { updateRunStatus } from "../services/workflow.ts";

export async function fitCommand(context: CommandContext): Promise<void> {
  await ensureRepo(context.repoRoot);
  const targetId = getStringArg(context.args, "target") ?? (await latestRun(context.repoRoot))?.id;
  if (!targetId) {
    throw new Error("fit requires --target or an existing latest run");
  }

  const run = await resolveRun(context.repoRoot, targetId);
  if (!run || run.workflow !== "trend") {
    throw new Error(`fit only supports trend runs. Unknown or invalid target: ${targetId}`);
  }

  const verdictArg = getStringArg(context.args, "verdict");
  if (verdictArg !== "approved" && verdictArg !== "rejected") {
    throw new Error("fit requires --verdict approved|rejected");
  }

  if (run.status !== "fit-checking" && run.status !== "fit-approved" && run.status !== "fit-rejected") {
    throw new Error(`Trend run ${run.id} is in status ${run.status} and cannot accept fit verdict.`);
  }
  if (verdictArg === "approved" || verdictArg === "rejected") {
    await assertTrendFitCheckComplete(run);
  }

  const now = toIsoNow();
  const nextStatus = verdictArg === "approved" ? "fit-approved" : "fit-rejected";
  const fitCheckPath = path.join(run.path, "fit-check.md");
  const fitCheckRaw = await readText(fitCheckPath);
  const updatedFitCheck = fitCheckRaw
    .replace(/^status:\s*.*$/mu, `status: ${nextStatus}`)
    .replace(/^updated_at:\s*.*$/mu, `updated_at: ${now}`)
    .replace(/## Verdict\s*\n- .*/mu, `## Verdict\n- ${verdictArg}`);
  await writeText(fitCheckPath, updatedFitCheck.endsWith("\n") ? updatedFitCheck : `${updatedFitCheck}\n`);
  await updateRunStatus(run, nextStatus, now);

  console.log(`Recorded fit verdict for ${run.id}: ${verdictArg}`);
  console.log(fitCheckPath);
  const refs = workflowReferencePaths(context.repoRoot, "trend");
  console.log(`Trend command: ${refs.commands[0]}`);
  console.log(`Specs: ${refs.specs.join(", ")}`);
  console.log(`Prompts: ${refs.prompts.join(", ")}`);
  console.log(`Next: ${suggestNextStep("trend", nextStatus).replace("<id>", run.id)}`);
}
