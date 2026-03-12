import fs from "node:fs/promises";
import path from "node:path";

import type { ParsedArgs } from "./types.ts";

export function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = { _: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (!value.startsWith("--")) {
      parsed._.push(value);
      continue;
    }

    const key = value.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }

    parsed[key] = next;
    index += 1;
  }

  return parsed;
}

export function getStringArg(args: ParsedArgs, key: string): string | undefined {
  const value = args[key];
  return typeof value === "string" ? value : undefined;
}

export function getBooleanArg(args: ParsedArgs, key: string): boolean {
  return args[key] === true;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/giu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

export function formatDate(date = new Date()): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export function toIsoNow(): string {
  return new Date().toISOString();
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function readText(targetPath: string): Promise<string> {
  return fs.readFile(targetPath, "utf8");
}

export async function writeText(targetPath: string, content: string): Promise<void> {
  await ensureDir(path.dirname(targetPath));
  await fs.writeFile(targetPath, content, "utf8");
}

export async function writeTextIfMissing(targetPath: string, content: string): Promise<void> {
  if (await pathExists(targetPath)) {
    return;
  }

  await writeText(targetPath, content);
}

export function yamlStringify(value: Record<string, unknown>): string {
  return Object.entries(value)
    .map(([key, raw]) => {
      if (Array.isArray(raw)) {
        if (raw.length === 0) {
          return `${key}: []`;
        }

        return `${key}:\n${raw.map((entry) => `  - ${escapeYamlScalar(entry)}`).join("\n")}`;
      }

      return `${key}: ${escapeYamlScalar(raw)}`;
    })
    .join("\n");
}

function escapeYamlScalar(value: unknown): string {
  if (value === null || value === undefined) {
    return "null";
  }

  const text = String(value);
  if (text === "" || /[:#[\]{}]|^\s|\s$/.test(text)) {
    return JSON.stringify(text);
  }

  return text;
}

export function parseSimpleYaml(input: string): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  let currentArrayKey: string | null = null;

  for (const line of input.split(/\r?\n/u)) {
    if (!line.trim() || line.trim().startsWith("#")) {
      continue;
    }

    if (line.startsWith("  - ") && currentArrayKey) {
      const current = result[currentArrayKey];
      const item = stripQuotes(line.slice(4).trim());
      if (Array.isArray(current)) {
        current.push(item);
      } else {
        result[currentArrayKey] = [item];
      }
      continue;
    }

    currentArrayKey = null;
    const match = line.match(/^([^:]+):\s*(.*)$/u);
    if (!match) {
      continue;
    }

    const [, rawKey, rawValue] = match;
    const key = rawKey.trim();
    const value = rawValue.trim();

    if (value === "") {
      currentArrayKey = key;
      result[key] = [];
      continue;
    }

    result[key] = stripQuotes(value);
  }

  return result;
}

export function createFrontmatter(meta: Record<string, unknown>, body: string): string {
  return `---\n${yamlStringify(meta)}\n---\n\n${body.trim()}\n`;
}

export function placeholder(label: string): string {
  return `<placeholder>${label}</placeholder>`;
}

export function parseFrontmatter(input: string): {
  meta: Record<string, string | string[]>;
  body: string;
} {
  const match = input.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/u);
  if (!match) {
    return { meta: {}, body: input };
  }

  return {
    meta: parseSimpleYaml(match[1]),
    body: match[2] ?? "",
  };
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

export async function copyDir(sourceDir: string, targetDir: string): Promise<void> {
  await ensureDir(targetDir);
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await copyDir(sourcePath, targetPath);
      continue;
    }

    await ensureDir(path.dirname(targetPath));
    await fs.copyFile(sourcePath, targetPath);
  }
}

export async function listDirectories(parentDir: string): Promise<string[]> {
  if (!(await pathExists(parentDir))) {
    return [];
  }

  const entries = await fs.readdir(parentDir, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
}
