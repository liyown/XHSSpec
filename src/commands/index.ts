import type { CommandContext } from "../types.ts";
import { archiveCommand } from "./archive.ts";
import { doctorCommand } from "./doctor.ts";
import { draftCommand } from "./draft.ts";
import { fitCommand } from "./fit.ts";
import { hotCommand } from "./hot.ts";
import { initCommand } from "./init.ts";
import { iterateCommand } from "./iterate.ts";
import { planCommand } from "./plan.ts";
import { publishCommand } from "./publish.ts";
import { quickCommand } from "./quick.ts";
import { reviewCommand } from "./review.ts";
import { statusCommand } from "./status.ts";
import { validateCommand } from "./validate.ts";

export type CommandHandler = (context: CommandContext) => Promise<void>;

export const commandRegistry: Record<string, CommandHandler> = {
  init: initCommand,
  doctor: doctorCommand,
  plan: planCommand,
  quick: quickCommand,
  hot: hotCommand,
  draft: draftCommand,
  fit: fitCommand,
  iterate: iterateCommand,
  review: reviewCommand,
  publish: publishCommand,
  archive: archiveCommand,
  status: statusCommand,
  validate: validateCommand,
};
