import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { expect, test } from "bun:test";

import {
  describeCampaignBoard,
  describeCampaignBoardSummary,
  describeNextCampaignAction,
  describeCampaignPublishTimeline,
  explainNextCampaignNote,
  recommendNextCampaignNote,
  syncCampaignMetadata,
} from "../src/services/campaign.ts";
import { inspectRun } from "../src/services/workflow.ts";
import { yamlStringify } from "../src/utils.ts";

test("syncCampaignMetadata updates tasks and actual note count", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhs-spec-campaign-"));
  const campaignPath = path.join(tempRoot, "campaign");

  await fs.mkdir(path.join(campaignPath, "drafts"), { recursive: true });
  await fs.mkdir(path.join(campaignPath, "reviews"), { recursive: true });
  await fs.writeFile(path.join(campaignPath, "drafts", "note-01.md"), "# d1\n");
  await fs.writeFile(path.join(campaignPath, "drafts", "note-02.v2.md"), "# d2\n");
  await fs.writeFile(path.join(campaignPath, "reviews", "note-01.review.md"), "# r1\n");
  await fs.writeFile(path.join(campaignPath, "campaign.yaml"), "id: c1\nplanned_note_count: 3\nactual_note_count: 0\nupdated_at: old\n");
  await fs.writeFile(path.join(campaignPath, "tasks.md"), "# old\n");

  await syncCampaignMetadata(campaignPath, "2026-03-12T02:00:00.000Z");

  const tasks = await fs.readFile(path.join(campaignPath, "tasks.md"), "utf8");
  const meta = await fs.readFile(path.join(campaignPath, "campaign.yaml"), "utf8");

  expect(tasks).toContain("## Note Strategy");
  expect(tasks).toContain("### note-03");
  expect(tasks).toContain("## Execution Board");
  expect(tasks).toContain("- [x] note-01 draft");
  expect(tasks).toContain("- [x] note-01 review");
  expect(tasks).toContain("- [ ] note-01 publish");
  expect(tasks).toContain("- [x] note-02 draft");
  expect(meta).toContain("actual_note_count: 2");
  expect(meta).toContain("updated_at: 2026-03-12T02:00:00.000Z");
});

test("describeCampaignBoard summarizes note progress", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhs-spec-campaign-board-"));
  const campaignPath = path.join(tempRoot, "campaign");

  await fs.mkdir(path.join(campaignPath, "drafts"), { recursive: true });
  await fs.mkdir(path.join(campaignPath, "reviews"), { recursive: true });
  await fs.writeFile(path.join(campaignPath, "drafts", "note-01.md"), "# d1\n");
  await fs.writeFile(path.join(campaignPath, "reviews", "note-01.review.md"), "# r1\n");
  await fs.writeFile(path.join(campaignPath, "campaign.yaml"), "id: c1\nplanned_note_count: 2\nactual_note_count: 1\nupdated_at: old\n");

  const board = await describeCampaignBoard(campaignPath);

  expect(board).toContain("note-01: draft / review / todo");
  expect(board).toContain("note-02: todo / todo / todo");
});

test("campaign progress summarizes published notes and recommends the next note", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhs-spec-campaign-publish-"));
  const campaignPath = path.join(tempRoot, ".xhsspec", "campaigns", "campaign-01");
  const publishDir = path.join(tempRoot, "publish", "2026-03-13", "campaign-01-note-01");

  await fs.mkdir(path.join(campaignPath, "drafts"), { recursive: true });
  await fs.mkdir(path.join(campaignPath, "reviews"), { recursive: true });
  await fs.mkdir(publishDir, { recursive: true });
  await fs.writeFile(path.join(campaignPath, "drafts", "note-01.md"), "# d1\n");
  await fs.writeFile(path.join(campaignPath, "reviews", "note-01.review.md"), "# r1\n");
  await fs.writeFile(path.join(campaignPath, "campaign.yaml"), "id: campaign-01\nplanned_note_count: 3\nactual_note_count: 1\nupdated_at: old\n");
  await fs.writeFile(
    path.join(publishDir, "post-meta.yaml"),
    `${yamlStringify({
      run_id: "campaign-01",
      workflow: "campaign",
      note_id: "note-01",
      publish_date: "2026-03-13",
      title: "note-01",
    })}\n`,
    "utf8",
  );

  const board = await describeCampaignBoard(campaignPath);
  const summary = await describeCampaignBoardSummary(campaignPath);
  const timeline = await describeCampaignPublishTimeline(campaignPath);
  const nextNote = await recommendNextCampaignNote(campaignPath);
  const nextReason = await explainNextCampaignNote(campaignPath);

  expect(board).toContain("note-01: draft / review / published");
  expect(board).toContain("note-02: todo / todo / todo");
  expect(summary).toContain("planned notes: 3");
  expect(summary).toContain("published notes: 1");
  expect(summary).toContain("latest publish: 2026-03-13 / note-01");
  expect(summary).toContain("recommended next note: note-02");
  expect(summary).toContain("why next: note-02 还没有首稿，继续推进它能让系列保持顺序展开。");
  expect(timeline).toContain("2026-03-13: note-01 (note-01)");
  expect(nextNote).toBe("note-02");
  expect(nextReason).toBe("note-02 还没有首稿，继续推进它能让系列保持顺序展开。");
});

test("campaign does not advance to the next note when current review artifact is still incomplete", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhs-spec-campaign-incomplete-review-"));
  const campaignPath = path.join(tempRoot, ".xhsspec", "campaigns", "campaign-01");

  await fs.mkdir(path.join(campaignPath, "drafts"), { recursive: true });
  await fs.mkdir(path.join(campaignPath, "reviews"), { recursive: true });
  await fs.writeFile(path.join(campaignPath, "drafts", "note-01.md"), "# note-01\n\n## Hook\n- 完整 hook\n", "utf8");
  await fs.writeFile(
    path.join(campaignPath, "reviews", "note-01.review.md"),
    "# Review\n\n## Verdict\n- fix\n\n## Strengths\n- What is already working: <placeholder>补充</placeholder>\n",
    "utf8",
  );
  await fs.writeFile(path.join(campaignPath, "campaign.yaml"), "id: campaign-01\nplanned_note_count: 2\nactual_note_count: 1\nupdated_at: old\n", "utf8");

  const board = await describeCampaignBoard(campaignPath);
  const nextNote = await recommendNextCampaignNote(campaignPath);
  const nextAction = await describeNextCampaignAction(campaignPath);
  const nextReason = await explainNextCampaignNote(campaignPath);

  expect(board).toContain("note-01: draft / reviewing / todo");
  expect(nextNote).toBe("note-01");
  expect(nextAction).toBe("review");
  expect(nextReason).toBe("note-01 已有 review artifact，但审稿还没完成，先把这一篇收紧再开下一篇更稳。");
});

test("inspectRun exposes a copy-ready agent message for campaign next step", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhs-spec-campaign-status-"));
  const campaignPath = path.join(tempRoot, ".xhsspec", "campaigns", "campaign-01");

  await fs.mkdir(path.join(campaignPath, "drafts"), { recursive: true });
  await fs.mkdir(path.join(campaignPath, "reviews"), { recursive: true });
  await fs.writeFile(
    path.join(campaignPath, "campaign.yaml"),
    "id: campaign-01\nstatus: reviewing\nplanned_note_count: 2\nactual_note_count: 1\nupdated_at: old\ntitle: AI series\n",
    "utf8",
  );
  await fs.writeFile(path.join(campaignPath, "drafts", "note-01.md"), "# d1\n", "utf8");
  await fs.mkdir(path.join(tempRoot, ".xhsspec", "specs"), { recursive: true });
  await fs.mkdir(path.join(tempRoot, ".xhsspec", "commands"), { recursive: true });
  await fs.mkdir(path.join(tempRoot, ".xhsspec", "prompts"), { recursive: true });

  const detail = await inspectRun({
    id: "campaign-01",
    workflow: "campaign",
    status: "reviewing",
    path: campaignPath,
    title: "AI series",
    updatedAt: "2026-03-13T00:00:00.000Z",
    nextStep: "xhs-spec status --target campaign-01",
  });

  expect(detail.next_note).toBe("note-01");
  expect(detail.next_action).toBe("review");
  expect(String(detail.agent_message)).toContain("请继续推进 note-01。");
  expect(String(detail.agent_message)).toContain("这一步先完成 note-01 的 review");
  expect(String(detail.agent_message)).toContain("如果 note-01.review.md 里还有 <placeholder>...</placeholder>");
});
