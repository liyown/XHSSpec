import path from "node:path";

import type { CommandContext } from "../types.ts";
import { ensureRepo } from "../lib/context.ts";
import { getXhsopsPath, workflowReferencePaths } from "../repo.ts";
import { assertBrandReadyForCreation } from "../services/completeness.ts";
import { baseFrontmatter } from "../services/workflow.ts";
import { createFrontmatter, ensureDir, formatDate, getStringArg, placeholder, toIsoNow, writeText, yamlStringify, slugify } from "../utils.ts";

export async function quickCommand(context: CommandContext): Promise<void> {
  await ensureRepo(context.repoRoot);
  await assertBrandReadyForCreation(context.repoRoot);
  const idea = getStringArg(context.args, "idea");
  if (!idea) {
    throw new Error("quick requires --idea");
  }

  const now = toIsoNow();
  const runId = getStringArg(context.args, "id") ?? `quick-${formatDate()}-${slugify(idea) || "run"}`;
  const runDir = getXhsopsPath(context.repoRoot, "quick", runId);
  await ensureDir(runDir);

  const runMeta = {
    id: runId,
    type: "quick",
    workflow: "quick",
    status: "drafting",
    idea,
    angle: getStringArg(context.args, "angle") ?? placeholder("补充本篇角度"),
    cta: getStringArg(context.args, "cta") ?? placeholder("补充本篇 CTA"),
    created_at: now,
    updated_at: now,
  };

  await writeText(path.join(runDir, "run.yaml"), `${yamlStringify(runMeta)}\n`);
  await writeText(
    path.join(runDir, "brief.md"),
    createFrontmatter(
      baseFrontmatter(runId, "quick", "drafting"),
      [
        "# Quick Brief",
        "",
        `- Idea: ${idea}`,
        `- Angle: ${runMeta.angle}`,
        `- Audience segment: ${placeholder("从 .xhsops/brand/audience.md 提取受众段")}`,
        `- Core pain point: ${placeholder("补充核心痛点")}`,
        `- Promise or payoff: ${placeholder("补充读者收益")}`,
        `- CTA: ${runMeta.cta}`,
        "- Audience fit: Fill from .xhsops/brand/audience.md",
        "- Constraints: Follow .xhsops/specs/note.spec.md and creation.spec.md",
        `- Proof or example to mention: ${placeholder("补充案例或证据")}`,
        "- What to avoid: Check brand/taboo.md",
      ].join("\n"),
    ),
  );
  await writeText(
    path.join(runDir, "draft.md"),
    createFrontmatter(
      baseFrontmatter(runId, "quick", "drafting"),
      [
        "# Draft",
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

  console.log(`Created quick run: ${runId}`);
  console.log(path.join(runDir, "brief.md"));
  console.log(path.join(runDir, "draft.md"));
  const refs = workflowReferencePaths(context.repoRoot, "quick");
  console.log(`Read with agent: ${refs.commands[0]}`);
  console.log(`Specs: ${refs.specs.join(", ")}`);
  console.log(`Prompts: ${refs.prompts.join(", ")}`);
  console.log(`Next: /xhs:quick or xhsops review --target ${runId}`);
}
