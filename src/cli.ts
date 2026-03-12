#!/usr/bin/env bun

import { createContext } from "./lib/context.ts";
import { runCommand } from "./commands.ts";
import { parseArgs } from "./utils.ts";

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const context = await createContext(args);
  const exitCode = await runCommand(context);
  if (typeof exitCode === "number") {
    process.exitCode = exitCode;
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
