#!/bin/bash

set -e

# Function to restore original addresses
restore_addresses() {
    BOND_FACTORY_ADDRESS="0x5e771e1417100000000000000000000000000004"
    CRYPTO_CURRENCY_FACTORY_ADDRESS="0x5e771e1417100000000000000000000000000001"
    EQUITY_FACTORY_ADDRESS="0x5e771e1417100000000000000000000000000003"
    STABLE_COIN_FACTORY_ADDRESS="0x5e771e1417100000000000000000000000000002"

    yq -i "(.dataSources[] | select(.name == \"BondFactory\").source.address) = \"$BOND_FACTORY_ADDRESS\"" subgraph.yaml
    yq -i "(.dataSources[] | select(.name == \"CryptoCurrencyFactory\").source.address) = \"$CRYPTO_CURRENCY_FACTORY_ADDRESS\"" subgraph.yaml
    yq -i "(.dataSources[] | select(.name == \"EquityFactory\").source.address) = \"$EQUITY_FACTORY_ADDRESS\"" subgraph.yaml
    yq -i "(.dataSources[] | select(.name == \"StableCoinFactory\").source.address) = \"$STABLE_COIN_FACTORY_ADDRESS\"" subgraph.yaml
    echo "Original addresses restored."
}

trap restore_addresses EXIT

# Read the new addresses from deployed_addresses.json
BOND_FACTORY_ADDRESS=$(jq -r '."BondFactoryModule#BondFactory"' ../contracts/ignition/deployments/chain-31337/deployed_addresses.json)
CRYPTO_CURRENCY_FACTORY_ADDRESS=$(jq -r '."CryptoCurrencyFactoryModule#CryptoCurrencyFactory"' ../contracts/ignition/deployments/chain-31337/deployed_addresses.json)
EQUITY_FACTORY_ADDRESS=$(jq -r '."EquityFactoryModule#EquityFactory"' ../contracts/ignition/deployments/chain-31337/deployed_addresses.json)
STABLE_COIN_FACTORY_ADDRESS=$(jq -r '."StableCoinFactoryModule#StableCoinFactory"' ../contracts/ignition/deployments/chain-31337/deployed_addresses.json)

# Update the addresses in subgraph.yaml
yq -i "(.dataSources[] | select(.name == \"BondFactory\").source.address) = \"$BOND_FACTORY_ADDRESS\"" subgraph.yaml
yq -i "(.dataSources[] | select(.name == \"CryptoCurrencyFactory\").source.address) = \"$CRYPTO_CURRENCY_FACTORY_ADDRESS\"" subgraph.yaml
yq -i "(.dataSources[] | select(.name == \"EquityFactory\").source.address) = \"$EQUITY_FACTORY_ADDRESS\"" subgraph.yaml
yq -i "(.dataSources[] | select(.name == \"StableCoinFactory\").source.address) = \"$STABLE_COIN_FACTORY_ADDRESS\"" subgraph.yaml

bun graph codegen
bun graph create --node http://localhost:8020 starterkit
bun graph deploy --version-label v1.0.$(date +%s) --node http://localhost:8020 --ipfs https://ipfs.network.thegraph.com starterkit subgraph.yaml

echo 'Check it out on http://localhost:8000/subgraphs/name/starterkit/'
