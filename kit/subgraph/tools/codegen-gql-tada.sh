#!/usr/bin/env bash
set -uo pipefail

# Retry up to 10 times to generate schema and output
n=0
max_attempts=10
OUTPUT_FILE="./the-graph-env.d.ts"

until [ $n -ge $max_attempts ]; do
    if bunx gql.tada generate-schema http://localhost:8000/subgraphs/name/kit-integration-tests -c ./test/tsconfig.json && \
       bunx gql.tada generate-output -c ./test/tsconfig.json --output "${OUTPUT_FILE}"; then
        break
    else
        n=$((n+1))
        if [ $n -lt $max_attempts ]; then
            echo "Attempt $n / $max_attempts failed, retrying in 5 seconds..."
            sleep 5
        fi
    fi
done

if [ $n -ge $max_attempts ]; then
    echo "Failed to generate gql-tada schema after $max_attempts attempts" >&2
    exit 1
fi
