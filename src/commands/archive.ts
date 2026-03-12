import path from "node:path";

import type { CommandContext } from "../types.ts";
import { ensureRepo } from "../lib/context.ts";
import { latestRun, resolveRun, workflowReferencePaths } from "../repo.ts";
import { syncCampaignMetadata } from "../services/campaign.ts";
import { assertReadyForArchive } from "../services/completeness.ts";
import { appendKnowledgeStub, canArchive, defaultOutcome, updateRunStatus } from "../services/workflow.ts";
import { createFrontmatter, getStringArg, placeholder, toIsoNow, writeText } from "../utils.ts";

export async function archiveCommand(context: CommandContext): Promise<void> {
  await ensureRepo(context.repoRoot);
  const targetId = getStringArg(context.args, "target") ?? (await latestRun(context.repoRoot))?.id;
  if (!targetId) {
    throw new Error("archive requires --target or an existing latest run");
  }

  const run = await resolveRun(context.repoRoot, targetId);
  if (!run) {
    throw new Error(`Unknown target: ${targetId}`);
  }
  if (!canArchive(run)) {
    throw new Error(`Run ${run.id} is in status ${run.status} and cannot be archived yet.`);
  }

  const outcome = getStringArg(context.args, "outcome") ?? defaultOutcome(run);
  const noteId = run.workflow === "campaign" ? getStringArg(context.args, "note") ?? "note-01" : undefined;
  await assertReadyForArchive(run, noteId);
  const retrospectivePath = path.join(run.path, "retrospective.md");
  const now = toIsoNow();

  await writeText(
    retrospectivePath,
    createFrontmatter(
      {
        id: `${run.id}-retrospective`,
        workflow: run.workflow,
        status: "archived",
        outcome,
        updated_at: now,
      },
      [
        "# Retrospective",
        "",
        "## Outcome",
        `- ${outcome}`,
        "",
        "## What Worked",
        `- Message: ${placeholder("补充有效信息点")}`,
        `- Structure: ${placeholder("补充有效结构")}`,
        `- CTA: ${placeholder("补充有效 CTA")}`,
        "",
        "## What Failed",
        `- Weak point: ${placeholder("补充薄弱点")}`,
        `- Missed assumption: ${placeholder("补充误判假设")}`,
        "",
        "## Reusable Pattern",
        `- Pattern: ${placeholder("提炼并同步到 knowledge 的模式")}`,
        `- When to reuse: ${placeholder("补充复用场景")}`,
        "",
        "## Spec Update Suggestion",
        `- Suggested repo update: ${placeholder("补充建议的 spec 更新")}`,
      ].join("\n"),
    ),
  );

  await appendKnowledgeStub(context.repoRoot, run, outcome);
  await updateRunStatus(run, "archived", now);
  if (run.workflow === "campaign") {
    await syncCampaignMetadata(run.path, now);
  }

  console.log(`Archived ${run.id}`);
  console.log(retrospectivePath);
  const refs = workflowReferencePaths(context.repoRoot, run.workflow);
  console.log(`Read with agent: ${refs.commands.find((ref) => ref.endsWith("xhs-archive.md")) ?? refs.commands[0]}`);
  console.log(`Specs: ${refs.specs.join(", ")}`);
  console.log(`Prompts: ${refs.prompts.join(", ")}`);
  console.log("Knowledge updated under .xhsops/knowledge/");
}
