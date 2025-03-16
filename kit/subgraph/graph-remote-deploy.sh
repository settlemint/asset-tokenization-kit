#!/bin/bash

set -e

# Function to restore original addresses
restore_addresses() {
    BOND_FACTORY_ADDRESS="0x5e771e1417100000000000000000000000000004"
    CRYPTO_CURRENCY_FACTORY_ADDRESS="0x5e771e1417100000000000000000000000000001"
    EQUITY_FACTORY_ADDRESS="0x5e771e1417100000000000000000000000000003"
    STABLE_COIN_FACTORY_ADDRESS="0x5e771e1417100000000000000000000000000002"
    FUND_FACTORY_ADDRESS="0x5e771e1417100000000000000000000000000005"
    FIXED_YIELD_FACTORY_ADDRESS="0x5e771e1417100000000000000000000000000006"
    TOKENIZED_DEPOSIT_FACTORY_ADDRESS="0x5e771e1417100000000000000000000000000007"

    yq -i "(.dataSources[] | select(.name == \"BondFactory\").source.address) = \"$BOND_FACTORY_ADDRESS\"" subgraph.yaml
    yq -i "(.dataSources[] | select(.name == \"CryptoCurrencyFactory\").source.address) = \"$CRYPTO_CURRENCY_FACTORY_ADDRESS\"" subgraph.yaml
    yq -i "(.dataSources[] | select(.name == \"EquityFactory\").source.address) = \"$EQUITY_FACTORY_ADDRESS\"" subgraph.yaml
    yq -i "(.dataSources[] | select(.name == \"StableCoinFactory\").source.address) = \"$STABLE_COIN_FACTORY_ADDRESS\"" subgraph.yaml
    yq -i "(.dataSources[] | select(.name == \"FundFactory\").source.address) = \"$FUND_FACTORY_ADDRESS\"" subgraph.yaml
    yq -i "(.dataSources[] | select(.name == \"FixedYieldFactory\").source.address) = \"$FIXED_YIELD_FACTORY_ADDRESS\"" subgraph.yaml
    yq -i "(.dataSources[] | select(.name == \"TokenizedDepositFactory\").source.address) = \"$TOKENIZED_DEPOSIT_FACTORY_ADDRESS\"" subgraph.yaml
    echo "Original addresses restored."
}

trap restore_addresses EXIT

# Read the new addresses from deployed_addresses.json
BOND_FACTORY_ADDRESS=$(jq -r '."BondFactoryModule#BondFactory"' ../contracts/ignition/deployments/asset-tokenization/deployed_addresses.json)
CRYPTO_CURRENCY_FACTORY_ADDRESS=$(jq -r '."CryptoCurrencyFactoryModule#CryptoCurrencyFactory"' ../contracts/ignition/deployments/asset-tokenization/deployed_addresses.json)
EQUITY_FACTORY_ADDRESS=$(jq -r '."EquityFactoryModule#EquityFactory"' ../contracts/ignition/deployments/asset-tokenization/deployed_addresses.json)
STABLE_COIN_FACTORY_ADDRESS=$(jq -r '."StableCoinFactoryModule#StableCoinFactory"' ../contracts/ignition/deployments/asset-tokenization/deployed_addresses.json)
FUND_FACTORY_ADDRESS=$(jq -r '."FundFactoryModule#FundFactory"' ../contracts/ignition/deployments/asset-tokenization/deployed_addresses.json)
FIXED_YIELD_FACTORY_ADDRESS=$(jq -r '."FixedYieldFactoryModule#FixedYieldFactory"' ../contracts/ignition/deployments/asset-tokenization/deployed_addresses.json)
TOKENIZED_DEPOSIT_FACTORY_ADDRESS=$(jq -r '."TokenizedDepositFactoryModule#TokenizedDepositFactory"' ../contracts/ignition/deployments/asset-tokenization/deployed_addresses.json)
# Update the addresses in subgraph.yaml
yq -i "(.dataSources[] | select(.name == \"BondFactory\").source.address) = \"$BOND_FACTORY_ADDRESS\"" subgraph.yaml
yq -i "(.dataSources[] | select(.name == \"CryptoCurrencyFactory\").source.address) = \"$CRYPTO_CURRENCY_FACTORY_ADDRESS\"" subgraph.yaml
yq -i "(.dataSources[] | select(.name == \"EquityFactory\").source.address) = \"$EQUITY_FACTORY_ADDRESS\"" subgraph.yaml
yq -i "(.dataSources[] | select(.name == \"StableCoinFactory\").source.address) = \"$STABLE_COIN_FACTORY_ADDRESS\"" subgraph.yaml
yq -i "(.dataSources[] | select(.name == \"FundFactory\").source.address) = \"$FUND_FACTORY_ADDRESS\"" subgraph.yaml
yq -i "(.dataSources[] | select(.name == \"FixedYieldFactory\").source.address) = \"$FIXED_YIELD_FACTORY_ADDRESS\"" subgraph.yaml
yq -i "(.dataSources[] | select(.name == \"TokenizedDepositFactory\").source.address) = \"$TOKENIZED_DEPOSIT_FACTORY_ADDRESS\"" subgraph.yaml
# Print addresses for debugging
echo "Addresses being used:"
echo "BondFactory: $BOND_FACTORY_ADDRESS"
echo "CryptoCurrencyFactory: $CRYPTO_CURRENCY_FACTORY_ADDRESS"
echo "EquityFactory: $EQUITY_FACTORY_ADDRESS"
echo "StableCoinFactory: $STABLE_COIN_FACTORY_ADDRESS"
echo "FundFactory: $FUND_FACTORY_ADDRESS"
echo "FixedYieldFactory: $FIXED_YIELD_FACTORY_ADDRESS"
echo "TokenizedDepositFactory: $TOKENIZED_DEPOSIT_FACTORY_ADDRESS"
echo "---"

bun graph codegen
bun settlemint scs subgraph deploy
