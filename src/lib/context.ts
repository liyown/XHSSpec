import path from "node:path";

import type { CommandContext } from "../types.ts";
import { findRepoRoot, getXhsopsPath } from "../repo.ts";
import { getStringArg, pathExists } from "../utils.ts";

export async function createContext(args: CommandContext["args"]): Promise<CommandContext> {
  const cwdArg = getStringArg(args, "cwd");
  const cwd = path.resolve(cwdArg ?? process.cwd());

  const command = String(args._[0] ?? "");
  const repoRoot = command === "init" ? cwd : (await findRepoRoot(cwd)) ?? cwd;

  return { cwd, repoRoot, args };
}

export async function ensureRepo(repoRoot: string): Promise<void> {
  const configPath = getXhsopsPath(repoRoot, "config.yaml");
  if (!(await pathExists(configPath))) {
    throw new Error(`No .xhsops repo found from ${repoRoot}. Run xhsops init first.`);
  }
}
