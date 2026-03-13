import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

import type { CommandContext } from "../types.ts";
import { getXhsSpecPath } from "../repo.ts";
import { copyDir, getStringArg, pathExists, readText, writeText } from "../utils.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SUPPORTED_TOOLS = ["codex", "cursor", "claude-code", "vscode"] as const;
type SupportedTool = (typeof SUPPORTED_TOOLS)[number];

export async function initCommand(context: CommandContext): Promise<void> {
  const xhsspecDir = getXhsSpecPath(context.cwd);
  const templateRepoDir = await resolveAssetPath("templates", "repo", ".xhsspec");
  const integrationsDir = await resolveAssetPath("templates", "integrations");

  if ((await pathExists(xhsspecDir)) && context.args.force !== true) {
    throw new Error(`.xhsspec already exists in ${context.cwd}. Use --force to overwrite.`);
  }

  if (await pathExists(xhsspecDir)) {
    await fs.rm(xhsspecDir, { recursive: true, force: true });
  }

  await copyDir(templateRepoDir, xhsspecDir);
  const tools = await resolveTools(context);
  await installToolIntegrations(context.cwd, integrationsDir, tools);
  await recordSelectedTools(xhsspecDir, tools);

  console.log(`Initialized XHSSpec repo in ${xhsspecDir}`);
  console.log(`Installed tool integrations: ${tools.length > 0 ? tools.join(", ") : "none"}`);
  console.log("Next steps:");
  console.log("- Fill at least: brand/profile.md, brand/audience.md, brand/offer.md, brand/tone.md, brand/taboo.md");
  console.log("- Then fill: strategy/content-pillars.md and strategy/topic-frameworks.md");
  console.log("- Use .xhsspec/START-HERE.md as the onboarding checklist");
  console.log("- Start creating: /xhs:quick, /xhs:hot, or /xhs:plan");
  console.log("- Validate anytime with: xhs-spec validate --target repo");
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
    console.log("Select coding tools to install XHSSpec integrations for.");
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

async function installToolIntegrations(
  repoRoot: string,
  integrationsDir: string,
  tools: SupportedTool[],
): Promise<void> {
  for (const tool of tools) {
    const sourceDir = path.join(integrationsDir, tool);
    if (!(await pathExists(sourceDir))) {
      continue;
    }

    await copyDir(sourceDir, repoRoot);
  }
}

async function recordSelectedTools(xhsspecDir: string, tools: SupportedTool[]): Promise<void> {
  const configPath = path.join(xhsspecDir, "config.yaml");
  const current = await readText(configPath);
  const next = `${current.trimEnd()}\ninstalled_tools:\n${tools.map((tool) => `  - ${tool}`).join("\n")}\n`;
  await writeText(configPath, next);
}

async function resolveAssetPath(...segments: string[]): Promise<string> {
  const candidateRoots = [
    path.resolve(__dirname, "..", ".."),
    path.resolve(__dirname, ".."),
    process.cwd(),
  ];

  for (const root of candidateRoots) {
    const candidate = path.join(root, ...segments);
    if (await pathExists(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Unable to locate packaged asset: ${segments.join("/")}`);
}
