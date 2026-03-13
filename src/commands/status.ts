import path from "node:path";

import type { CommandContext } from "../types.ts";
import { ensureRepo } from "../lib/context.ts";
import { printStatus, printStatusDetail } from "../lib/output.ts";
import { collectRunCompletenessIssues } from "../services/completeness.ts";
import { inspectRun } from "../services/workflow.ts";
import { getStringArg } from "../utils.ts";
import { listRuns, resolveRun } from "../repo.ts";

export async function statusCommand(context: CommandContext): Promise<void> {
  await ensureRepo(context.repoRoot);
  const targetId = getStringArg(context.args, "target");
  const asJson = context.args.json === true;

  if (targetId) {
    const run = await resolveRun(context.repoRoot, targetId);
    if (!run) {
      throw new Error(`Unknown target: ${targetId}`);
    }

    const detail = await inspectRun(run);
    const completenessIssues = await collectRunCompletenessIssues(run);
    detail.incomplete_files = [...new Set(completenessIssues.map((issue) => path.relative(run.path, issue.filePath) || path.basename(issue.filePath)))];
    printStatusDetail(detail, asJson);
    return;
  }

  const runs = await listRuns(context.repoRoot);
  if (context.args.all !== true && runs.length > 8) {
    printStatus(runs.slice(0, 8), asJson);
    return;
  }

  printStatus(runs, asJson);
}
