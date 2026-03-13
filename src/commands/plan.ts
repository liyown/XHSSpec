import path from "node:path";

import type { CommandContext } from "../types.ts";
import { ensureRepo } from "../lib/context.ts";
import { getXhsSpecPath, workflowReferencePaths } from "../repo.ts";
import { assertBrandReadyForCreation } from "../services/completeness.ts";
import { syncCampaignMetadata } from "../services/campaign.ts";
import { baseFrontmatter } from "../services/workflow.ts";
import { createFrontmatter, ensureDir, formatDate, getStringArg, placeholder, slugify, toIsoNow, writeText, yamlStringify } from "../utils.ts";

export async function planCommand(context: CommandContext): Promise<void> {
  await ensureRepo(context.repoRoot);
  await assertBrandReadyForCreation(context.repoRoot);
  const theme = getStringArg(context.args, "theme");
  if (!theme) {
    throw new Error("plan requires --theme");
  }

  const now = toIsoNow();
  const campaignId = getStringArg(context.args, "id") ?? `campaign-${formatDate()}-${slugify(theme) || "run"}`;
  const campaignDir = getXhsSpecPath(context.repoRoot, "campaigns", campaignId);
  await ensureDir(path.join(campaignDir, "drafts"));
  await ensureDir(path.join(campaignDir, "reviews"));

  const campaignMeta = {
    id: campaignId,
    type: "campaign",
    workflow: "campaign",
    status: "created",
    goal: getStringArg(context.args, "goal") ?? "growth",
    theme,
    window: getStringArg(context.args, "window") ?? "weekly",
    planned_note_count: getStringArg(context.args, "count") ?? "3",
    actual_note_count: "0",
    created_at: now,
    updated_at: now,
  };

  await writeText(path.join(campaignDir, "campaign.yaml"), `${yamlStringify(campaignMeta)}\n`);
  await writeText(
    path.join(campaignDir, "proposal.md"),
    createFrontmatter(
      baseFrontmatter(campaignId, "campaign", "created"),
      [
        "# Campaign Proposal",
        "",
        `- Goal: ${campaignMeta.goal}`,
        `- Theme: ${theme}`,
        `- Window: ${campaignMeta.window}`,
        `- Planned notes: ${campaignMeta.planned_note_count}`,
        `- Primary audience: ${placeholder("补充主要受众")}`,
        `- Success signal: ${placeholder("补充成功信号")}`,
        "",
        "## Strategy",
        `- Pillar mix: ${placeholder("规划内容支柱组合")}`,
        `- Test angles: ${placeholder("规划要测试的角度")}`,
        "- Sequence logic: 从易传播到强证明",
      ].join("\n"),
    ),
  );
  await writeText(
    path.join(campaignDir, "brief.md"),
    createFrontmatter(
      baseFrontmatter(campaignId, "campaign", "created"),
      [
        "# Campaign Brief",
        "",
        `- Audience target: ${placeholder("补充目标受众")}`,
        `- Message territory: ${placeholder("补充信息疆域")}`,
        `- Success metric: ${placeholder("补充成功指标")}`,
        "- CTA policy: Follow brand and note spec",
        `- Campaign thesis: ${placeholder("补充 campaign 核心主张")}`,
        `- Narrative arc across notes: ${placeholder("补充多篇叙事结构")}`,
        `- Proof assets or examples: ${placeholder("补充证明材料或案例")}`,
      ].join("\n"),
    ),
  );
  await writeText(
    path.join(campaignDir, "tasks.md"),
    createFrontmatter(
      baseFrontmatter(campaignId, "campaign", "created"),
      "# Tasks\n\n## Note Strategy\n\n### note-01\n- Role: <placeholder>补充该篇在系列中的角色</placeholder>\n- Angle hypothesis: <placeholder>补充该篇要验证的角度</placeholder>\n- Publish purpose: <placeholder>补充该篇的收藏/评论/转化目标</placeholder>\n\n## Execution Board\n\n- [ ] note-01 draft\n- [ ] note-01 review\n- [ ] note-01 rewrite if needed\n- [ ] Retrospective",
    ),
  );
  await syncCampaignMetadata(campaignDir, now);

  console.log(`Created campaign: ${campaignId}`);
  console.log(path.join(campaignDir, "proposal.md"));
  console.log(path.join(campaignDir, "brief.md"));
  console.log(path.join(campaignDir, "tasks.md"));
  const refs = workflowReferencePaths(context.repoRoot, "campaign");
  console.log(`Read with agent: ${refs.commands[0]}`);
  console.log(`Specs: ${refs.specs.join(", ")}`);
  console.log(`Prompts: ${refs.prompts.join(", ")}`);
  console.log(`Next: ask the agent to complete proposal.md, brief.md, and tasks.md, then run xhs-spec draft --target ${campaignId} --note note-01`);
}
