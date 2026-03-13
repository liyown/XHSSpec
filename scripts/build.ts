import { chmod, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");
const outfile = path.join(distDir, "cli.js");

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

const result = Bun.spawnSync({
  cmd: [
    "bun",
    "build",
    "./src/cli.ts",
    "--outfile",
    "./dist/cli.js",
    "--target=node",
    "--format=esm",
  ],
  cwd: process.cwd(),
  stdout: "inherit",
  stderr: "inherit",
});

if (result.exitCode !== 0) {
  process.exit(result.exitCode);
}

const original = await Bun.file(outfile).text();
const withShebang = original.startsWith("#!")
  ? original
  : `#!/usr/bin/env bun\n// @bun\n${original}`;

await Bun.write(outfile, withShebang);
await chmod(outfile, 0o755);

console.log(`Built ${outfile}`);
