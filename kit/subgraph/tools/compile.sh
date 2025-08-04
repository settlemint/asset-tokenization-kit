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

    # Build and capture IPFS hash
    bunx settlemint scs subgraph build --ipfs=https://ipfs.console.settlemint.com | \
        tee >(grep -o 'Qm[a-zA-Z0-9]*' | tail -1 | \
            tee .generated/subgraph-hash.txt | \
            xargs -I {} echo 'SUBGRAPH=kit:{}' > .generated/subgraph-env)
else
    # Address doesn't match, just build without updating generated files
    bunx settlemint scs subgraph build --ipfs=https://ipfs.console.settlemint.com
fi