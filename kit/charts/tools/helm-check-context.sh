#!/usr/bin/env bash
set -euo pipefail

# Check if we're in the orbstack context
current_context=$(kubectl config current-context)

if [ "$current_context" != "orbstack" ]; then
    echo "Error: Not in orbstack context. Current context: $current_context" >&2
    exit 1
fi