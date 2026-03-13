#!/usr/bin/env sh
set -eu

bun run test
bun run build
npm pack --dry-run
npm publish "$@"
