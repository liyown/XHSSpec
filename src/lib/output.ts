import type { RunRecord } from "../types.ts";

export function printStatus(runs: RunRecord[], asJson: boolean): void {
  if (asJson) {
    console.log(JSON.stringify(runs, null, 2));
    return;
  }

  if (runs.length === 0) {
    console.log("No runs found.");
    return;
  }

  for (const run of runs) {
    console.log(`${run.id}`);
    console.log(`  workflow: ${run.workflow}`);
    console.log(`  status: ${run.status}`);
    console.log(`  title: ${run.title}`);
    console.log(`  next: ${run.nextStep.replace("<id>", run.id)}`);
  }
}

export function printStatusDetail(detail: Record<string, unknown>, asJson: boolean): void {
  if (asJson) {
    console.log(JSON.stringify(detail, null, 2));
    return;
  }

  console.log(String(detail.id));
  console.log(`  workflow: ${String(detail.workflow)}`);
  console.log(`  status: ${String(detail.status)}`);
  console.log(`  title: ${String(detail.title)}`);
  console.log(`  path: ${String(detail.path)}`);
  console.log(`  next: ${String(detail.next)}`);

  const files = Array.isArray(detail.files) ? detail.files : [];
  if (files.length > 0) {
    console.log(`  files: ${files.join(", ")}`);
  }

  if (detail.workflow === "campaign") {
    console.log(`  drafts: ${String(detail.draft_count ?? 0)}`);
    console.log(`  reviews: ${String(detail.review_count ?? 0)}`);
  } else {
    console.log(`  has_review: ${String(detail.has_review ?? false)}`);
    const iterations = Array.isArray(detail.iteration_files) ? detail.iteration_files : [];
    if (iterations.length > 0) {
      console.log(`  iterations: ${iterations.join(", ")}`);
    }
  }

  const specs = Array.isArray(detail.spec_refs) ? detail.spec_refs : [];
  const prompts = Array.isArray(detail.prompt_refs) ? detail.prompt_refs : [];
  const commands = Array.isArray(detail.command_refs) ? detail.command_refs : [];

  if (specs.length > 0) {
    console.log(`  specs: ${specs.join(", ")}`);
  }
  if (prompts.length > 0) {
    console.log(`  prompts: ${prompts.join(", ")}`);
  }
  if (commands.length > 0) {
    console.log(`  commands: ${commands.join(", ")}`);
  }
}

export function printHelp(): void {
  console.log("XHSSpec CLI");
  console.log("");
  console.log("Commands:");
  console.log("  init [--force] [--cwd <path>]");
  console.log("  doctor [--cwd <path>]");
  console.log("  plan --theme <text> [--goal <goal>] [--count <n>] [--window weekly|monthly] [--id <id>] [--cwd <path>]");
  console.log("  quick --idea <text> [--angle <text>] [--cta <text>] [--id <id>] [--cwd <path>]");
  console.log("  hot --topic <text> [--source <text>] [--urgency <level>] [--id <id>] [--cwd <path>]");
  console.log("  draft --target <id> [--note note-01] [--cwd <path>]");
  console.log("  fit --target <id> --verdict approved|rejected [--cwd <path>]");
  console.log("  iterate --target <id> [--round 2] [--note note-01] [--cwd <path>]");
  console.log("  review --target <id> [--mode light|standard] [--note note-01] [--cwd <path>]");
  console.log("  publish --target <id> [--note note-01] [--title <title>] [--date YYYY-MM-DD] [--cwd <path>]");
  console.log("  archive --target <id> [--outcome published|dropped|completed] [--cwd <path>]");
  console.log("  status [--target <id>] [--all] [--json] [--cwd <path>]");
  console.log("  validate [--target repo|<id>] [--json] [--cwd <path>]");
}
