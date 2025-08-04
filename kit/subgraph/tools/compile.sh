#!/usr/bin/env bash
set -euo pipefail

# Check if the SystemFactory address matches the expected value
if grep -q '0x5e771e1417100000000000000000000000020088' subgraph.yaml; then
    # Address matches, write to generated files
    mkdir -p .generated

    # Create default subgraph-env if it doesn't exist
    if [ ! -f .generated/subgraph-env ]; then
        echo 'SUBGRAPH=kit:' > .generated/subgraph-env
    fi

    echo "SystemFactory address is the default, building and updating generated files"
    # Build and capture IPFS hash
    BUILD_OUTPUT=$(bunx settlemint scs subgraph build --ipfs=https://ipfs.console.settlemint.com) || { echo "Error: Subgraph build failed." >&2; exit 1; }
    echo "$BUILD_OUTPUT"

    # Extract subgraph hash and save to files
    SUBGRAPH_HASH=$(echo "$BUILD_OUTPUT" | grep -o 'Qm[a-zA-Z0-9]*' | tail -1)
    if [ -n "$SUBGRAPH_HASH" ]; then
        echo "$SUBGRAPH_HASH" > .generated/subgraph-hash.txt
        echo "SUBGRAPH=kit:$SUBGRAPH_HASH" > .generated/subgraph-env
        echo "Saved subgraph hash: $SUBGRAPH_HASH"
    else
        echo "Warning: No subgraph hash found in build output"
    fi
else
    # Address doesn't match, just build without updating generated files
    echo "SystemFactory address doesn't match the default, just building without updating generated files"
    bunx settlemint scs subgraph build --ipfs=https://ipfs.console.settlemint.com
fi