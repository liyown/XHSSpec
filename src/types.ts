export type WorkflowKind = "campaign" | "quick" | "trend";

export type QuickStatus =
  | "initialized"
  | "briefed"
  | "drafting"
  | "reviewed"
  | "done"
  | "archived";

export type TrendStatus =
  | "initialized"
  | "fit-checking"
  | "fit-approved"
  | "fit-rejected"
  | "drafting"
  | "reviewed"
  | "done"
  | "dropped"
  | "archived";

export type CampaignStatus =
  | "initialized"
  | "planned"
  | "briefing"
  | "drafting"
  | "reviewing"
  | "iterating"
  | "ready"
  | "archived"
  | "cancelled";

export type RunStatus = QuickStatus | TrendStatus | CampaignStatus;

export interface CommandContext {
  cwd: string;
  repoRoot: string;
  args: ParsedArgs;
}

export interface ParsedArgs {
  _: string[];
  [key: string]: string | boolean | string[];
}

export interface RunRecord {
  id: string;
  workflow: WorkflowKind;
  status: RunStatus;
  path: string;
  title: string;
  updatedAt: string;
  nextStep: string;
}

export interface ValidationIssue {
  level: "error" | "warning";
  message: string;
  path: string;
}
