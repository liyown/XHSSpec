import type { CommandContext } from "../types.ts";
import { ensureRepo } from "../lib/context.ts";
import { getStringArg } from "../utils.ts";
import { validateRepo, validateRun } from "../repo.ts";

export async function validateCommand(context: CommandContext): Promise<void> {
  await ensureRepo(context.repoRoot);
  const target = getStringArg(context.args, "target") ?? "repo";
  const asJson = context.args.json === true;
  const issues = target === "repo" ? await validateRepo(context.repoRoot) : await validateRun(context.repoRoot, target);

  if (asJson) {
    console.log(JSON.stringify(issues, null, 2));
  } else if (issues.length === 0) {
    console.log(`Validation passed for ${target}`);
  } else {
    for (const issue of issues) {
      console.log(`${issue.level.toUpperCase()}: ${issue.message} -> ${issue.path}`);
    }
  }

  if (issues.some((issue) => issue.level === "error")) {
    process.exitCode = 1;
  }
}
