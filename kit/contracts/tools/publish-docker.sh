#!/usr/bin/env bash
set -euo pipefail

# Base version from root package.json (e.g. 2.0.0)
BASE_VERSION="$(jq -r .version ../../package.json)"
PRIMARY_TAG="$BASE_VERSION"
ALIAS_TAGS=()

# In CI on main, publish monotonic semver-like prerelease
if [[ -n "${CI:-}" && "${GITHUB_REF:-}" == "refs/heads/main" ]]; then
  RUN_NO="${GITHUB_RUN_NUMBER:-0}"
  SHORT_SHA="${GITHUB_SHA:-nogit}"
  SHORT_SHA="${SHORT_SHA:0:8}"
  PRIMARY_TAG="${BASE_VERSION}-main.${RUN_NO}.${SHORT_SHA}"
  ALIAS_TAGS+=("${BASE_VERSION}-main")
elif [[ -z "${CI:-}" ]]; then
  PRIMARY_TAG="${BASE_VERSION}-dev.$(date +%s)"
fi

# Build and push Docker image
TAGS_OPTS=( -t "ghcr.io/settlemint/asset-tokenization-kit-artifacts:${PRIMARY_TAG}" )
for t in "${ALIAS_TAGS[@]:-}"; do
  TAGS_OPTS+=( -t "ghcr.io/settlemint/asset-tokenization-kit-artifacts:${t}" )
done

docker buildx build . \
  --file=./Dockerfile \
  --platform=linux/amd64,linux/arm64 \
  --provenance true \
  --sbom true \
  "${TAGS_OPTS[@]}" \
  --push
