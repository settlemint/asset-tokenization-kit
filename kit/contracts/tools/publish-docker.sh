#!/usr/bin/env bash
set -euo pipefail

# Ensure script runs from monorepo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../" && pwd)"
cd "$REPO_ROOT"

# Get version from root package.json
DOCKER_BUILD_TAG=$(jq -r .version package.json)

# Add dev timestamp if not in CI
if [ -z "${CI:-}" ]; then
    DOCKER_BUILD_TAG="$DOCKER_BUILD_TAG-dev.$(date +%s)"
fi

# Build and push Docker image
docker buildx build . \
    --file=./Dockerfile.contracts \
    --platform=linux/amd64,linux/arm64 \
    --provenance true \
    --sbom true \
    -t "ghcr.io/settlemint/asset-tokenization-kit-artifacts:$DOCKER_BUILD_TAG" \
    --push
