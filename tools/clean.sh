#!/usr/bin/env bash
set -euo pipefail

# Clean git files, excluding env files and turbo config
git clean -fdX -e '.env' -e '.env.*' -e '!.env' -e '!.env.*' -e '.turbo/config.json'

# Remove lockfiles
find . -type f \( -name 'pnpm-lock.yaml' -o -name 'package-lock.json' -o -name 'yarn.lock' -o -name 'bun.lockb' -o -name 'bun.lock' \) -exec rm -f {} +

# Reinstall dependencies
bun install