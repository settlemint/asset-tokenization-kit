#!/usr/bin/env bash
set -euo pipefail

# Ensure the subgraph hash artifact exists so the bootstrapper can publish the ConfigMap
if [ -f ../subgraph/.generated/subgraph-hash.txt ]; then
    hash=$(tr -d '\n' < ../subgraph/.generated/subgraph-hash.txt)
    echo "Subgraph hash detected (${hash}). Network bootstrapper will ingest it via --subgraph-hash-file."
    yq eval ".subgraph.fallbackHash = \"${hash}\"" -i atk/charts/network/charts/network-bootstrapper/values.yaml
else
    echo "Warning: Subgraph hash file not found at ../subgraph/.generated/subgraph-hash.txt" >&2
fi
