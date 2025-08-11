#!/usr/bin/env bash
set -euo pipefail

# Stop and remove Docker containers and volumes
docker compose -p atk down

# Remove Docker volumes
docker volume ls -q --filter name=^atk | xargs -r docker volume rm 2>/dev/null || true

# Turbo cache-buster for dapp codegen
echo "$(date +%s)" > kit/dapp/.dev-reset