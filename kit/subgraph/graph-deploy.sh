#!/bin/bash

set -e

# Validate arguments
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 --local|--remote"
    exit 1
fi

DEPLOY_ENV=""
if [ "$1" == "--local" ]; then
    DEPLOY_ENV="local"
elif [ "$1" == "--remote" ]; then
    DEPLOY_ENV="remote"
else
    echo "Error: Invalid argument. Use --local or --remote."
    echo "Usage: $0 --local|--remote"
    exit 1
fi

echo
echo "---"
echo "Deployment environment: $DEPLOY_ENV"

# Function to restore original addresses
restore_addresses() {
    FORWARDER_ADDRESS="0x5e771e1417100000000000000000000000000099"
    SMART_DEPLOYMENT_REGISTRY_ADDRESS="0x5e771e1417100000000000000000000000020001"

    yq -i "(.dataSources[] | select(.name == \"Forwarder\").source.address) = \"$FORWARDER_ADDRESS\"" subgraph.yaml
    yq -i "(.dataSources[] | select(.name == \"SMARTDeploymentRegistry\").source.address) = \"$SMART_DEPLOYMENT_REGISTRY_ADDRESS\"" subgraph.yaml

    echo "Original addresses restored."
}

trap restore_addresses EXIT

# Read the new addresses from deployed_addresses.json
FORWARDER_ADDRESS=$(jq -r '."ForwarderModule#Forwarder"' ../contracts/ignition/deployments/asset-tokenization-local/deployed_addresses.json)
SMART_DEPLOYMENT_REGISTRY_ADDRESS=$(jq -r '."DeploymentRegistryModule#SMARTDeploymentRegistry"' ../contracts/ignition/deployments/asset-tokenization-local/deployed_addresses.json)

# Update the addresses in subgraph.yaml
yq -i "(.dataSources[] | select(.name == \"Forwarder\").source.address) = \"$FORWARDER_ADDRESS\"" subgraph.yaml
yq -i "(.dataSources[] | select(.name == \"SMARTDeploymentRegistry\").source.address) = \"$SMART_DEPLOYMENT_REGISTRY_ADDRESS\"" subgraph.yaml

# Print addresses for debugging
echo "---"
echo "Addresses being used:"
echo "  Forwarder: $FORWARDER_ADDRESS"
echo "  SMARTDeploymentRegistry: $SMART_DEPLOYMENT_REGISTRY_ADDRESS"
echo "---"
echo

bun graph codegen

if [ "$DEPLOY_ENV" == "local" ]; then
bun graph create --node http://localhost:8020 kit
bun graph deploy --version-label v1.0.$(date +%s) --node http://localhost:8020 --ipfs https://ipfs.console.settlemint.com kit subgraph.yaml
elif [ "$DEPLOY_ENV" == "remote" ]; then
bun settlemint scs subgraph deploy
fi