import type { CommandContext } from "../types.ts";
import { ensureRepo } from "../lib/context.ts";
import { getXhsopsPath } from "../repo.ts";
import { listRuns, validateRepo } from "../repo.ts";

export async function doctorCommand(context: CommandContext): Promise<void> {
  await ensureRepo(context.repoRoot);
  const issues = await validateRepo(context.repoRoot);
  const runs = await listRuns(context.repoRoot);

  console.log("XHSOps Doctor");
  console.log("");
  console.log(`Repo: ${context.repoRoot}`);
  console.log(`Runs: ${runs.length}`);
  console.log(`Errors: ${issues.filter((issue) => issue.level === "error").length}`);
  console.log(`Warnings: ${issues.filter((issue) => issue.level === "warning").length}`);
  console.log(`Specs dir: ${getXhsopsPath(context.repoRoot, "specs")}`);
  console.log(`Commands dir: ${getXhsopsPath(context.repoRoot, "commands")}`);
  console.log(`Prompts dir: ${getXhsopsPath(context.repoRoot, "prompts")}`);

  if (issues.length > 0) {
    console.log("");
    for (const issue of issues.slice(0, 12)) {
      console.log(`${issue.level.toUpperCase()}: ${issue.message} -> ${issue.path}`);
    }
  }

  if (runs.length > 0) {
    const latest = runs[0];
    console.log("");
    console.log(`Latest run: ${latest.id} (${latest.workflow}/${latest.status})`);
    console.log(`Next: ${latest.nextStep.replace("<id>", latest.id)}`);
  }

  if (issues.some((issue) => issue.level === "error")) {
    process.exitCode = 1;
  }
}
