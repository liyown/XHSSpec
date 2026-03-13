import path from "node:path";

import type { CommandContext } from "../types.ts";
import { ensureRepo } from "../lib/context.ts";
import { getXhsSpecPath, workflowReferencePaths } from "../repo.ts";
import { assertBrandReadyForCreation } from "../services/completeness.ts";
import { baseFrontmatter } from "../services/workflow.ts";
import { createFrontmatter, ensureDir, formatDate, getStringArg, placeholder, slugify, toIsoNow, writeText, yamlStringify } from "../utils.ts";

export async function hotCommand(context: CommandContext): Promise<void> {
  await ensureRepo(context.repoRoot);
  await assertBrandReadyForCreation(context.repoRoot);
  const topic = getStringArg(context.args, "topic");
  if (!topic) {
    throw new Error("hot requires --topic");
  }

  const now = toIsoNow();
  const runId = getStringArg(context.args, "id") ?? `trend-${formatDate()}-${slugify(topic) || "run"}`;
  const runDir = getXhsSpecPath(context.repoRoot, "trends", runId);
  await ensureDir(runDir);

  const runMeta = {
    id: runId,
    type: "trend",
    workflow: "trend",
    status: "created",
    topic,
    source_summary: getStringArg(context.args, "source") ?? placeholder("补充热点来源摘要"),
    urgency: getStringArg(context.args, "urgency") ?? "normal",
    created_at: now,
    updated_at: now,
  };

  await writeText(path.join(runDir, "run.yaml"), `${yamlStringify(runMeta)}\n`);
  await writeText(
    path.join(runDir, "trend-brief.md"),
    createFrontmatter(
      baseFrontmatter(runId, "trend", "created"),
      [
        "# Trend Brief",
        "",
        `- Topic: ${topic}`,
        `- Source summary: ${runMeta.source_summary}`,
        `- Urgency: ${runMeta.urgency}`,
        `- Brand relevance hypothesis: ${placeholder("判断与品牌的相关性")}`,
        `- Audience usefulness: ${placeholder("判断对受众的价值")}`,
        `- Differentiated point of view: ${placeholder("补充差异化视角")}`,
        `- Risk note: ${placeholder("补充风险提示")}`,
      ].join("\n"),
    ),
  );
  await writeText(
    path.join(runDir, "fit-check.md"),
    createFrontmatter(
      baseFrontmatter(runId, "trend", "created"),
      [
        "# Fit Check",
        "",
        "## Verdict",
        `- ${placeholder("填写 approved 或 rejected")}`,
        "",
        "## Why it fits",
        `- Brand relevance: ${placeholder("分析品牌相关性")}`,
        `- Audience usefulness: ${placeholder("分析受众价值")}`,
        `- Timing: ${placeholder("分析时机是否合适")}`,
        "",
        "## Risks",
        `- Compliance: ${placeholder("分析合规风险")}`,
        `- Brand mismatch: ${placeholder("分析品牌偏离风险")}`,
        `- Genericity risk: ${placeholder("分析同质化风险")}`,
        "",
        "## Recommendation",
        "- Draft or drop",
        `- Recommended angle if approved: ${placeholder("补充推荐切入角度")}`,
      ].join("\n"),
    ),
  );
  await writeText(
    path.join(runDir, "draft.md"),
    createFrontmatter(baseFrontmatter(runId, "trend", "created"), "# Trend Draft\n\nOnly fill this after fit-check is approved."),
  );

  console.log(`Created trend run: ${runId}`);
  console.log(path.join(runDir, "trend-brief.md"));
  console.log(path.join(runDir, "fit-check.md"));
  const refs = workflowReferencePaths(context.repoRoot, "trend");
  console.log(`Read with agent: ${refs.commands[0]}`);
  console.log(`Specs: ${refs.specs.join(", ")}`);
  console.log(`Prompts: ${refs.prompts.join(", ")}`);
  console.log(`Next: ask the agent to complete trend-brief.md and fit-check.md, then run xhs-spec fit --target ${runId} --verdict approved|rejected`);
}
