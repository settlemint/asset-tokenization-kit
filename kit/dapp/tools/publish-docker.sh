#!/usr/bin/env bash
set -euo pipefail

# Get version from root package.json
DOCKER_BUILD_TAG=$(jq -r .version ../../package.json)

# Add dev timestamp if not in CI
if [ -z "${CI:-}" ]; then
    DOCKER_BUILD_TAG="$DOCKER_BUILD_TAG-dev.$(date +%s)"
fi

# Ensure script runs from monorepo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../" && pwd)"
cd "$REPO_ROOT"

# Copy Code studio Dockerfile
cp Dockerfile.dapp Dockerfile

# Build and push Docker image
docker buildx build . \
    --platform=linux/amd64,linux/arm64 \
    --provenance true \
    --sbom true \
    -t "ghcr.io/settlemint/asset-tokenization-kit:$DOCKER_BUILD_TAG" \
    --push