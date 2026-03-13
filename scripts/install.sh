#!/usr/bin/env sh
set -eu

PACKAGE_NAME="${XHS_SPEC_PACKAGE_NAME:-xhs-spec}"
PACKAGE_VERSION="${XHS_SPEC_PACKAGE_VERSION:-latest}"
INSTALL_MODE="${XHS_SPEC_INSTALL_MODE:-global}"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 20+ is required."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required."
  exit 1
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "Node.js 20+ is required. Current version: $(node -v)"
  exit 1
fi

PACKAGE_SPEC="$PACKAGE_NAME"
if [ "$PACKAGE_VERSION" != "latest" ]; then
  PACKAGE_SPEC="${PACKAGE_NAME}@${PACKAGE_VERSION}"
fi

case "$INSTALL_MODE" in
  global)
    npm install --global "$PACKAGE_SPEC"
    ;;
  local)
    npm install --save-dev "$PACKAGE_SPEC"
    ;;
  *)
    echo "Unsupported XHS_SPEC_INSTALL_MODE: $INSTALL_MODE"
    echo "Use 'global' or 'local'."
    exit 1
    ;;
esac

echo "Installed $PACKAGE_SPEC"
echo "Run 'xhs-spec init --tools codex' to start."
