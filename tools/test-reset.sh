#!/usr/bin/env bash
set -euo pipefail

# Stop and remove test Docker containers, volumes, and images
docker compose --env-file .env.test -f docker-compose.yml -f docker-compose.test.yml -p atk-test down -v --remove-orphans --rmi local

# Remove test Docker volumes
docker volume ls -q --filter name=^atk-test | xargs -r docker volume rm 2>/dev/null || true