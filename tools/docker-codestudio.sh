#!/usr/bin/env bash
set -euo pipefail

# Get version from package.json
DOCKER_BUILD_TAG=$(jq -r .version package.json)

# Add dev timestamp if not in CI
if [ -z "${CI:-}" ]; then
    DOCKER_BUILD_TAG="$DOCKER_BUILD_TAG-dev.$(date +%s)"
fi

# Copy Code studio Dockerfile
cp Dockerfile.code-studio Dockerfile

# Build and push Docker image
docker buildx build . \
    --platform=linux/amd64,linux/arm64 \
    --provenance true \
    --sbom true \
    -t "ghcr.io/settlemint/codestudio-asset-tokenization-kit:$DOCKER_BUILD_TAG" \
    --push