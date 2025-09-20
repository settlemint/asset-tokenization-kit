#!/usr/bin/env bash
set -euo pipefail

# Update the subgraph hash in TheGraph values
if [ -f ../subgraph/.generated/subgraph-hash.txt ]; then
    hash=$(cat ../subgraph/.generated/subgraph-hash.txt | tr -d '\n')
    yq eval ".graph-node.graphNodeDefaults.env.SUBGRAPH = \"kit:${hash}\"" -i atk/charts/graph-node/values.yaml
else
    echo "Warning: Subgraph hash file not found at ../subgraph/.generated/subgraph-hash.txt" >&2
fi