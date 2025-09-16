#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Generate Besu genesis artifacts locally using the same container logic as the Helm job.

Usage: generate-manual-genesis.sh [--values <file>] [--output <dir>] [--artifacts <dir>] [--validators <count>]

  --values, -f       Path to besu-genesis values file (default: chart values.yaml)
  --output, -o       Directory to place generated artifacts (default: ./output)
  --artifacts        Optional path with contract artifact overrides mounted at /contracts/genesis
  --validators, -v   Number of validators to generate (overrides values file)
  --help, -h         Show this help message
USAGE
}

require_cmd() {
  local cmd=$1
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: required command '$cmd' not found" >&2
    exit 1
  fi
}

indent() {
  local prefix=$1
  sed "s/^/${prefix}/"
}

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
CHART_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
VALUES_FILE="$CHART_DIR/values.yaml"
OUTPUT_DIR="$CHART_DIR/output"
ARTIFACTS_DIR=""
VALIDATOR_COUNT_OVERRIDE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --values|-f)
      shift
      [[ $# -gt 0 ]] || { echo "Missing argument for --values" >&2; exit 1; }
      VALUES_FILE=$1
      ;;
    --output|-o)
      shift
      [[ $# -gt 0 ]] || { echo "Missing argument for --output" >&2; exit 1; }
      OUTPUT_DIR=$1
      ;;
    --artifacts)
      shift
      [[ $# -gt 0 ]] || { echo "Missing argument for --artifacts" >&2; exit 1; }
      ARTIFACTS_DIR=$1
      ;;
    --validators|-v)
      shift
      [[ $# -gt 0 ]] || { echo "Missing argument for --validators" >&2; exit 1; }
      VALIDATOR_COUNT_OVERRIDE=$1
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
  shift
done

require_cmd docker
require_cmd yq
require_cmd jq

VALUES_FILE=$(cd "$(dirname "$VALUES_FILE")" && pwd)/$(basename "$VALUES_FILE")
OUTPUT_DIR=$(mkdir -p "$OUTPUT_DIR" && cd "$OUTPUT_DIR" && pwd)

IMAGE_REPO=$(yq -r '.image.repository' "$VALUES_FILE")
IMAGE_TAG=$(yq -r '.image.tag' "$VALUES_FILE")
CONSENSUS=$(yq -r '.rawGenesisConfig.genesis.config.algorithm.consensus' "$VALUES_FILE")
CHAIN_ID=$(yq -r '.rawGenesisConfig.genesis.config.chainId' "$VALUES_FILE")
BLOCK_PERIOD=$(yq -r '.rawGenesisConfig.genesis.config.algorithm.blockperiodseconds' "$VALUES_FILE")
EPOCH_LENGTH=$(yq -r '.rawGenesisConfig.genesis.config.algorithm.epochlength' "$VALUES_FILE")
REQUEST_TIMEOUT=$(yq -r '.rawGenesisConfig.genesis.config.algorithm.requesttimeoutseconds' "$VALUES_FILE")
GAS_LIMIT=$(yq -r '.rawGenesisConfig.genesis.gasLimit' "$VALUES_FILE")
DIFFICULTY=$(yq -r '.rawGenesisConfig.genesis.difficulty' "$VALUES_FILE")
COINBASE=$(yq -r '.rawGenesisConfig.genesis.coinbase' "$VALUES_FILE")
INCLUDE_QA=$(yq -r '.rawGenesisConfig.genesis.includeQuickStartAccounts' "$VALUES_FILE")
ACCOUNT_PASSWORD=$(yq -r '.rawGenesisConfig.blockchain.accountPassword // ""' "$VALUES_FILE")
VALIDATORS_GENERATE=$(yq -r '.rawGenesisConfig.blockchain.nodes.generate' "$VALUES_FILE")
VALIDATOR_COUNT=$(yq -r '.rawGenesisConfig.blockchain.nodes.count' "$VALUES_FILE")
ALLOC_JSON=$(yq -o=json '.rawGenesisConfig.genesis.alloc // {}' "$VALUES_FILE")

if [[ "$IMAGE_REPO" == "null" || "$IMAGE_REPO" == "" ]]; then
  echo "Error: .image.repository not set in values file" >&2
  exit 1
fi
if [[ "$IMAGE_TAG" == "null" || "$IMAGE_TAG" == "" ]]; then
  echo "Error: .image.tag not set in values file" >&2
  exit 1
fi

VALIDATORS_ARG="0"
if [[ -n "$VALIDATOR_COUNT_OVERRIDE" ]]; then
  VALIDATORS_ARG="$VALIDATOR_COUNT_OVERRIDE"
  echo "Using validator count override: $VALIDATOR_COUNT_OVERRIDE"
elif [[ "$VALIDATORS_GENERATE" == "true" ]]; then
  VALIDATORS_ARG="$VALIDATOR_COUNT"
fi

DOCKER_ARGS=(docker run --rm -v "$OUTPUT_DIR:/generated-config")
if [[ -n "$ARTIFACTS_DIR" ]]; then
  ARTIFACTS_ABS=$(cd "$ARTIFACTS_DIR" && pwd)
  DOCKER_ARGS+=(-v "$ARTIFACTS_ABS:/contracts/genesis:ro")
fi

DOCKER_ARGS+=(--entrypoint quorum-genesis-tool "$IMAGE_REPO:$IMAGE_TAG")
DOCKER_ARGS+=(
  --consensus "$CONSENSUS"
  --validators "$VALIDATORS_ARG"
  --members 0
  --bootnodes 0
  --chainID "$CHAIN_ID"
  --blockperiod "$BLOCK_PERIOD"
  --epochLength "$EPOCH_LENGTH"
  --requestTimeout "$REQUEST_TIMEOUT"
  --difficulty "$DIFFICULTY"
  --gasLimit "$GAS_LIMIT"
  --coinbase "$COINBASE"
  --quickstartDevAccounts "$INCLUDE_QA"
  --alloc "$ALLOC_JSON"
)

if [[ -n "$ACCOUNT_PASSWORD" && "$ACCOUNT_PASSWORD" != "null" ]]; then
  DOCKER_ARGS+=(--accountPassword "$ACCOUNT_PASSWORD")
fi

DOCKER_ARGS+=(--outputPath /generated-config)

OUTPUT_LOG=$(mktemp)
trap 'rm -f "$OUTPUT_LOG"' EXIT

echo "Running quorum-genesis-tool container ..."
if ! "${DOCKER_ARGS[@]}" | tee "$OUTPUT_LOG"; then
  echo "Docker run failed" >&2
  exit 1
fi

CONTAINER_FOLDER=$(grep -Eo 'Artifacts in folder: .+' "$OUTPUT_LOG" | tail -n1 | sed 's/^Artifacts in folder: //')
if [[ -z "$CONTAINER_FOLDER" ]]; then
  echo "Failed to determine artifact folder from container output" >&2
  exit 1
fi

RELATIVE_FOLDER=${CONTAINER_FOLDER#/generated-config/}
if [[ "$RELATIVE_FOLDER" == "$CONTAINER_FOLDER" ]]; then
  ARTIFACT_DIR="$OUTPUT_DIR"
else
  ARTIFACT_DIR="$OUTPUT_DIR/$RELATIVE_FOLDER"
fi

if [[ ! -d "$ARTIFACT_DIR" ]]; then
  echo "Expected artifact directory $ARTIFACT_DIR not found" >&2
  exit 1
fi

GENESIS_FILE="$ARTIFACT_DIR/besu/genesis.json"
STATIC_NODES_FILE="$ARTIFACT_DIR/static-nodes.json"
if [[ ! -f "$GENESIS_FILE" ]]; then
  echo "Genesis file not found at $GENESIS_FILE" >&2
  exit 1
fi
if [[ ! -f "$STATIC_NODES_FILE" ]]; then
  echo "static-nodes.json not found at $STATIC_NODES_FILE" >&2
  exit 1
fi

SNIPPET_FILE="$OUTPUT_DIR/manual-values.yaml"
{
  echo "generation:"
  echo "  enabled: false"
  echo "  manual:"
  echo "    genesisJson: |-"
  indent "      " < "$GENESIS_FILE"
  echo "    staticNodes:"
  if jq -e '. | length > 0' "$STATIC_NODES_FILE" >/dev/null 2>&1; then
    jq -r '.[]' "$STATIC_NODES_FILE" | while IFS= read -r node; do
      printf '      - "%s"\n' "$node"
    done
  else
    echo "      []"
  fi
  echo "    bootnodes: []"
  echo "    validators:"
  i=1
  for dir in "$ARTIFACT_DIR"/validator*; do
    [[ -d "$dir" ]] || continue
    name="besu-node-validator-$i"
    echo "      - name: $name"
    echo "        keys:"
    echo "          nodekey: |-"
    indent "            " < "$dir/nodekey"
    echo "          nodekeyPub: |-"
    indent "            " < "$dir/nodekey.pub"
    echo "          address: |-"
    indent "            " < "$dir/address"
    echo "          accountPrivateKey: |-"
    indent "            " < "$dir/accountPrivateKey"
    if [[ -f "$dir/accountPassword" ]]; then
      echo "          accountPassword: |-"
      indent "            " < "$dir/accountPassword"
    else
      echo "          accountPassword: \"\""
    fi
    if [[ -f "$dir/accountKeystore" ]]; then
      echo "          accountKeystore: |-"
      indent "            " < "$dir/accountKeystore"
    else
      echo "          accountKeystore: \"\""
    fi
    if [[ -f "$dir/accountAddress" ]]; then
      echo "          accountAddress: |-"
      indent "            " < "$dir/accountAddress"
    else
      echo "          accountAddress: |-"
      indent "            " < "$dir/address"
    fi
    i=$((i + 1))
  done
} > "$SNIPPET_FILE"

trap - EXIT
rm -f "$OUTPUT_LOG"

echo
echo "Artifacts generated in: $ARTIFACT_DIR"
echo "Manual values snippet written to: $SNIPPET_FILE"
echo "Review and merge the snippet into your besu-genesis values before setting generation.enabled=false."
