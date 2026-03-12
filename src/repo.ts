import path from "node:path";

import type { RunRecord, ValidationIssue, WorkflowKind } from "./types.ts";
import {
  brandIssuesForValidation,
  collectRunCompletenessIssues,
  completenessIssuesForValidation,
} from "./services/completeness.ts";
import {
  listDirectories,
  parseFrontmatter,
  parseSimpleYaml,
  pathExists,
  readText,
} from "./utils.ts";

export const XHSOPS_DIR = ".xhsops";

const QUICK_DIR = path.join(XHSOPS_DIR, "quick");
const TREND_DIR = path.join(XHSOPS_DIR, "trends");
const CAMPAIGN_DIR = path.join(XHSOPS_DIR, "campaigns");

export async function findRepoRoot(startDir: string): Promise<string | null> {
  let current = path.resolve(startDir);

  while (true) {
    const configPath = path.join(current, XHSOPS_DIR, "config.yaml");
    if (await pathExists(configPath)) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }

    current = parent;
  }
}

export function getXhsopsPath(repoRoot: string, ...segments: string[]): string {
  return path.join(repoRoot, XHSOPS_DIR, ...segments);
}

export function workflowReferencePaths(repoRoot: string, workflow: WorkflowKind): {
  specs: string[];
  prompts: string[];
  commands: string[];
} {
  const specs =
    workflow === "trend"
      ? [
          getXhsopsPath(repoRoot, "specs", "trend.spec.md"),
          getXhsopsPath(repoRoot, "specs", "creation.spec.md"),
          getXhsopsPath(repoRoot, "specs", "review.spec.md"),
          getXhsopsPath(repoRoot, "specs", "publish.spec.md"),
        ]
      : [
          getXhsopsPath(repoRoot, "specs", "note.spec.md"),
          getXhsopsPath(repoRoot, "specs", "creation.spec.md"),
          getXhsopsPath(repoRoot, "specs", "review.spec.md"),
          getXhsopsPath(repoRoot, "specs", "publish.spec.md"),
        ];

  const prompts =
    workflow === "quick"
      ? [
          getXhsopsPath(repoRoot, "prompts", "quick-brief.md"),
          getXhsopsPath(repoRoot, "prompts", "quick-draft.md"),
          getXhsopsPath(repoRoot, "prompts", "review.md"),
          getXhsopsPath(repoRoot, "prompts", "rewrite.md"),
          getXhsopsPath(repoRoot, "prompts", "publish.md"),
          getXhsopsPath(repoRoot, "prompts", "archive.md"),
        ]
      : workflow === "trend"
        ? [
            getXhsopsPath(repoRoot, "prompts", "trend-fit-check.md"),
            getXhsopsPath(repoRoot, "prompts", "review.md"),
            getXhsopsPath(repoRoot, "prompts", "rewrite.md"),
            getXhsopsPath(repoRoot, "prompts", "publish.md"),
            getXhsopsPath(repoRoot, "prompts", "archive.md"),
          ]
        : [
            getXhsopsPath(repoRoot, "prompts", "campaign-plan.md"),
            getXhsopsPath(repoRoot, "prompts", "review.md"),
            getXhsopsPath(repoRoot, "prompts", "rewrite.md"),
            getXhsopsPath(repoRoot, "prompts", "publish.md"),
            getXhsopsPath(repoRoot, "prompts", "archive.md"),
          ];

  const commands =
    workflow === "quick"
      ? [
          getXhsopsPath(repoRoot, "commands", "xhs-quick.md"),
          getXhsopsPath(repoRoot, "commands", "xhs-review.md"),
          getXhsopsPath(repoRoot, "commands", "xhs-rewrite.md"),
          getXhsopsPath(repoRoot, "commands", "xhs-publish.md"),
          getXhsopsPath(repoRoot, "commands", "xhs-archive.md"),
        ]
      : workflow === "trend"
        ? [
            getXhsopsPath(repoRoot, "commands", "xhs-hot.md"),
            getXhsopsPath(repoRoot, "commands", "xhs-review.md"),
            getXhsopsPath(repoRoot, "commands", "xhs-rewrite.md"),
            getXhsopsPath(repoRoot, "commands", "xhs-publish.md"),
            getXhsopsPath(repoRoot, "commands", "xhs-archive.md"),
          ]
        : [
            getXhsopsPath(repoRoot, "commands", "xhs-plan.md"),
            getXhsopsPath(repoRoot, "commands", "xhs-review.md"),
            getXhsopsPath(repoRoot, "commands", "xhs-rewrite.md"),
            getXhsopsPath(repoRoot, "commands", "xhs-publish.md"),
            getXhsopsPath(repoRoot, "commands", "xhs-archive.md"),
          ];

  return { specs, prompts, commands };
}

export async function listRuns(repoRoot: string): Promise<RunRecord[]> {
  const quickRuns = await listWorkflowRuns(repoRoot, "quick");
  const trendRuns = await listWorkflowRuns(repoRoot, "trend");
  const campaignRuns = await listWorkflowRuns(repoRoot, "campaign");

  return [...quickRuns, ...trendRuns, ...campaignRuns].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
}

async function listWorkflowRuns(repoRoot: string, workflow: WorkflowKind): Promise<RunRecord[]> {
  const baseDir =
    workflow === "quick"
      ? getXhsopsPath(repoRoot, "quick")
      : workflow === "trend"
        ? getXhsopsPath(repoRoot, "trends")
        : getXhsopsPath(repoRoot, "campaigns");

  const names = await listDirectories(baseDir);
  const runs: RunRecord[] = [];

  for (const name of names) {
    const runPath = path.join(baseDir, name);
    const metaPath = workflow === "campaign" ? path.join(runPath, "campaign.yaml") : path.join(runPath, "run.yaml");
    if (!(await pathExists(metaPath))) {
      continue;
    }

    const meta = parseSimpleYaml(await readText(metaPath));
    runs.push({
      id: String(meta.id ?? name),
      workflow,
      status: String(meta.status ?? "initialized") as RunRecord["status"],
      path: runPath,
      title: String(meta.title ?? meta.idea ?? meta.topic ?? name),
      updatedAt: String(meta.updated_at ?? ""),
      nextStep: suggestNextStep(workflow, String(meta.status ?? "initialized")),
    });
  }

  return runs;
}

export function suggestNextStep(workflow: WorkflowKind, status: string): string {
  if (workflow === "quick") {
    if (status === "drafting" || status === "briefed") {
      return "/xhs:quick or xhsops review --target <id>";
    }
    if (status === "reviewed") {
      return "/xhs:rewrite or xhsops publish --target <id>";
    }
    if (status === "done") {
      return "xhsops archive --target <id>";
    }
    return "xhsops status --target <id>";
  }

  if (workflow === "trend") {
    if (status === "fit-checking") {
      return "/xhs:hot then xhsops fit --target <id> --verdict approved|rejected";
    }
    if (status === "fit-approved" || status === "drafting") {
      return "/xhs:draft then xhsops review --target <id>";
    }
    if (status === "fit-rejected" || status === "dropped") {
      return "xhsops archive --target <id> --outcome dropped";
    }
    if (status === "reviewed") {
      return "xhsops publish --target <id> or /xhs:rewrite";
    }
    if (status === "done") {
      return "xhsops archive --target <id>";
    }
    return "xhsops status --target <id>";
  }

  if (status === "planned" || status === "briefing") {
    return "/xhs:plan or xhsops draft --target <id> --note note-01";
  }
  if (status === "drafting" || status === "reviewing" || status === "iterating") {
    return "/xhs:draft or xhsops review --target <id>";
  }
  if (status === "reviewed") {
    return "/xhs:rewrite or xhsops publish --target <id> --note note-01";
  }
  if (status === "ready") {
    return "xhsops archive --target <id>";
  }
  return "/xhs:plan";
}

export async function resolveRun(repoRoot: string, targetId: string): Promise<RunRecord | null> {
  const runs = await listRuns(repoRoot);
  return runs.find((run) => run.id === targetId) ?? null;
}

export async function validateRepo(repoRoot: string): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];
  const requiredBaseFiles = [
    getXhsopsPath(repoRoot, "config.yaml"),
    getXhsopsPath(repoRoot, "brand", "profile.md"),
    getXhsopsPath(repoRoot, "brand", "audience.md"),
    getXhsopsPath(repoRoot, "brand", "offer.md"),
    getXhsopsPath(repoRoot, "brand", "tone.md"),
    getXhsopsPath(repoRoot, "brand", "taboo.md"),
    getXhsopsPath(repoRoot, "strategy", "content-pillars.md"),
    getXhsopsPath(repoRoot, "strategy", "topic-frameworks.md"),
    getXhsopsPath(repoRoot, "strategy", "keyword-map.md"),
    getXhsopsPath(repoRoot, "specs", "note.spec.md"),
    getXhsopsPath(repoRoot, "specs", "creation.spec.md"),
    getXhsopsPath(repoRoot, "specs", "review.spec.md"),
    getXhsopsPath(repoRoot, "specs", "trend.spec.md"),
    getXhsopsPath(repoRoot, "specs", "publish.spec.md"),
    getXhsopsPath(repoRoot, "specs", "slash-commands.md"),
    getXhsopsPath(repoRoot, "commands", "xhs-quick.md"),
    getXhsopsPath(repoRoot, "commands", "xhs-hot.md"),
    getXhsopsPath(repoRoot, "commands", "xhs-plan.md"),
    getXhsopsPath(repoRoot, "commands", "xhs-review.md"),
    getXhsopsPath(repoRoot, "commands", "xhs-rewrite.md"),
    getXhsopsPath(repoRoot, "commands", "xhs-publish.md"),
    getXhsopsPath(repoRoot, "commands", "xhs-archive.md"),
    getXhsopsPath(repoRoot, "prompts", "quick-brief.md"),
    getXhsopsPath(repoRoot, "prompts", "quick-draft.md"),
    getXhsopsPath(repoRoot, "prompts", "trend-fit-check.md"),
    getXhsopsPath(repoRoot, "prompts", "campaign-plan.md"),
    getXhsopsPath(repoRoot, "prompts", "review.md"),
    getXhsopsPath(repoRoot, "prompts", "rewrite.md"),
    getXhsopsPath(repoRoot, "prompts", "publish.md"),
    getXhsopsPath(repoRoot, "prompts", "archive.md"),
  ];

  for (const filePath of requiredBaseFiles) {
    if (!(await pathExists(filePath))) {
      issues.push({ level: "error", path: filePath, message: "Missing required repo file" });
    }
  }

  issues.push(...(await brandIssuesForValidation(repoRoot)));

  const runs = await listRuns(repoRoot);
  for (const run of runs) {
    issues.push(...(await validateRun(repoRoot, run.id)));
  }

  return issues;
}

export async function validateRun(repoRoot: string, targetId: string): Promise<ValidationIssue[]> {
  const run = await resolveRun(repoRoot, targetId);
  if (!run) {
    return [{ level: "error", path: targetId, message: "Unknown target id" }];
  }

  const issues: ValidationIssue[] = [];
  const requiredFiles =
    run.workflow === "quick"
      ? ["run.yaml", "brief.md", "draft.md"]
      : run.workflow === "trend"
        ? ["run.yaml", "trend-brief.md", "fit-check.md"]
        : ["campaign.yaml", "proposal.md", "brief.md", "tasks.md"];

  for (const filename of requiredFiles) {
    const filePath = path.join(run.path, filename);
    if (!(await pathExists(filePath))) {
      issues.push({ level: "error", path: filePath, message: "Missing required workflow artifact" });
    }
  }

  const markdownFiles = run.workflow === "quick"
    ? ["brief.md", "draft.md", "review.md"]
    : run.workflow === "trend"
      ? ["trend-brief.md", "fit-check.md", "draft.md", "review.md", "retrospective.md"]
      : ["proposal.md", "brief.md", "tasks.md", "retrospective.md"];

  for (const filename of markdownFiles) {
    const filePath = path.join(run.path, filename);
    if (!(await pathExists(filePath))) {
      continue;
    }

    const content = await readText(filePath);
    const parsed = parseFrontmatter(content);
    if (!parsed.meta.id || !parsed.meta.workflow || !parsed.meta.status) {
      issues.push({ level: "warning", path: filePath, message: "Missing expected frontmatter fields" });
    }
  }

  const completenessIssues = await collectRunCompletenessIssues(run);
  for (const issue of completenessIssues) {
    issues.push({ level: "warning", path: issue.filePath, message: issue.reason });
  }

  issues.push(...(await completenessIssuesForValidation(run)));

  return issues;
}

export async function latestRun(repoRoot: string): Promise<RunRecord | null> {
  const runs = await listRuns(repoRoot);
  return runs[0] ?? null;
}

export const workflowDirs = {
  quick: QUICK_DIR,
  trend: TREND_DIR,
  campaign: CAMPAIGN_DIR,
};
