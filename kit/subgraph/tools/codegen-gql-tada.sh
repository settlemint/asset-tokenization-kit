#!/usr/bin/env bash
set -euo pipefail

# Retry up to 3 times to generate schema and output
n=0
until [ $n -ge 3 ]; do
    if bunx gql-tada generate-schema http://localhost:8000/subgraphs/name/kit-integration-tests && \
       bunx gql-tada generate-output; then
        break
    else
        n=$((n+1))
        if [ $n -lt 3 ]; then
            sleep 5
        fi
    fi
done

if [ $n -ge 3 ]; then
    echo "Failed to generate gql-tada schema after 3 attempts" >&2
    exit 1
fi