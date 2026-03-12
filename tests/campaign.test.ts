import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { expect, test } from "bun:test";

import { syncCampaignMetadata } from "../src/services/campaign.ts";

test("syncCampaignMetadata updates tasks and actual note count", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xhsops-campaign-"));
  const campaignPath = path.join(tempRoot, "campaign");

  await fs.mkdir(path.join(campaignPath, "drafts"), { recursive: true });
  await fs.mkdir(path.join(campaignPath, "reviews"), { recursive: true });
  await fs.writeFile(path.join(campaignPath, "drafts", "note-01.md"), "# d1\n");
  await fs.writeFile(path.join(campaignPath, "drafts", "note-02.v2.md"), "# d2\n");
  await fs.writeFile(path.join(campaignPath, "reviews", "note-01.review.md"), "# r1\n");
  await fs.writeFile(path.join(campaignPath, "campaign.yaml"), "id: c1\nactual_note_count: 0\nupdated_at: old\n");
  await fs.writeFile(path.join(campaignPath, "tasks.md"), "# old\n");

  await syncCampaignMetadata(campaignPath, "2026-03-12T02:00:00.000Z");

  const tasks = await fs.readFile(path.join(campaignPath, "tasks.md"), "utf8");
  const meta = await fs.readFile(path.join(campaignPath, "campaign.yaml"), "utf8");

  expect(tasks).toContain("- [x] note-01 draft");
  expect(tasks).toContain("- [x] note-01 review");
  expect(tasks).toContain("- [x] note-02 draft");
  expect(meta).toContain("actual_note_count: 2");
  expect(meta).toContain("updated_at: 2026-03-12T02:00:00.000Z");
});
