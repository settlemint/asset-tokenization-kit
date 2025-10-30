#!/usr/bin/env bash
set -euo pipefail

# Remove all node_modules directories
find . -name 'node_modules' -type d -prune -exec rm -rf {} +
rm -Rf kit/contracts/dependencies

# Remove lockfiles
find . -type f \( -name 'pnpm-lock.yaml' -o -name 'package-lock.json' -o -name 'yarn.lock' -o -name 'bun.lockb' -o -name 'bun.lock' \) -exec rm -f {} +

# Reinstall dependencies
bun install