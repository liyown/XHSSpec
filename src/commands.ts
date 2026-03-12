import type { CommandContext } from "./types.ts";
import { printHelp } from "./lib/output.ts";
import { commandRegistry } from "./commands/index.ts";

export async function runCommand(context: CommandContext): Promise<number> {
  if (context.args.help === true) {
    printHelp();
    return 0;
  }

  const command = context.args._[0];
  if (!command || command === "help") {
    printHelp();
    return 0;
  }

  const handler = commandRegistry[command];
  if (!handler) {
    console.error(`Unknown command: ${command}`);
    printHelp();
    return 1;
  }

  await handler(context);
  return 0;
}
