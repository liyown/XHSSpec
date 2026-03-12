import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";

import type { CommandContext } from "../types.ts";
import { getXhsopsPath } from "../repo.ts";
import { copyDir, getStringArg, pathExists, readText, writeText } from "../utils.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_REPO_DIR = path.resolve(__dirname, "..", "..", "templates", "repo", ".xhsops");
const INTEGRATIONS_DIR = path.resolve(__dirname, "..", "..", "templates", "integrations");
const SUPPORTED_TOOLS = ["codex", "cursor", "claude-code", "vscode"] as const;
type SupportedTool = (typeof SUPPORTED_TOOLS)[number];

export async function initCommand(context: CommandContext): Promise<void> {
  const xhsopsDir = getXhsopsPath(context.cwd);
  if ((await pathExists(xhsopsDir)) && context.args.force !== true) {
    throw new Error(`.xhsops already exists in ${context.cwd}. Use --force to overwrite.`);
  }

  if (await pathExists(xhsopsDir)) {
    await fs.rm(xhsopsDir, { recursive: true, force: true });
  }

  await copyDir(TEMPLATE_REPO_DIR, xhsopsDir);
  const tools = await resolveTools(context);
  await installToolIntegrations(context.cwd, tools);
  await recordSelectedTools(xhsopsDir, tools);

  console.log(`Initialized XHSOps repo in ${xhsopsDir}`);
  console.log(`Installed tool integrations: ${tools.length > 0 ? tools.join(", ") : "none"}`);
  console.log("Next steps:");
  console.log("- Fill at least: brand/profile.md, brand/audience.md, brand/offer.md, brand/tone.md, brand/taboo.md");
  console.log("- Then fill: strategy/content-pillars.md and strategy/topic-frameworks.md");
  console.log("- Use .xhsops/START-HERE.md as the onboarding checklist");
  console.log("- Start creating: /xhs:quick, /xhs:hot, or /xhs:plan");
  console.log("- Validate anytime with: xhsops validate --target repo");
}

async function resolveTools(context: CommandContext): Promise<SupportedTool[]> {
  const toolArg = getStringArg(context.args, "tools");
  if (toolArg) {
    return parseTools(toolArg);
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return ["codex"];
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    console.log("Select coding tools to install XHSOps integrations for.");
    console.log("Available: codex, cursor, claude-code, vscode");
    console.log("Enter a comma-separated list, 'all', or leave blank for codex.");
    const answer = (await rl.question("> ")).trim();
    return parseTools(answer || "codex");
  } finally {
    rl.close();
  }
}

function parseTools(input: string): SupportedTool[] {
  if (input === "all") {
    return [...SUPPORTED_TOOLS];
  }

  const selected = input
    .split(",")
    .map((tool) => tool.trim())
    .filter(Boolean);

  const tools = selected.filter((tool): tool is SupportedTool =>
    SUPPORTED_TOOLS.includes(tool as SupportedTool),
  );

  if (tools.length === 0) {
    return ["codex"];
  }

  return [...new Set(tools)];
}

async function installToolIntegrations(repoRoot: string, tools: SupportedTool[]): Promise<void> {
  for (const tool of tools) {
    const sourceDir = path.join(INTEGRATIONS_DIR, tool);
    if (!(await pathExists(sourceDir))) {
      continue;
    }

    await copyDir(sourceDir, repoRoot);
  }
}

async function recordSelectedTools(xhsopsDir: string, tools: SupportedTool[]): Promise<void> {
  const configPath = path.join(xhsopsDir, "config.yaml");
  const current = await readText(configPath);
  const next = `${current.trimEnd()}\ninstalled_tools:\n${tools.map((tool) => `  - ${tool}`).join("\n")}\n`;
  await writeText(configPath, next);
}
