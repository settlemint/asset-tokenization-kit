#!/bin/bash

# Get the directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Construct full paths
CONTRACTS_PATH="$SCRIPT_DIR/src/lib/contracts.ts"
DEPLOYED_ADDRESSES_PATH="$SCRIPT_DIR/../contracts/ignition/deployments/chain-$1/deployed_addresses.json"

# Default fallback addresses
PREDEPLOYED_CRYPTO_CURRENCY_FACTORY_ADDRESS="0x5e771e1417100000000000000000000000000001"
PREDEPLOYED_STABLE_COIN_FACTORY_ADDRESS="0x5e771e1417100000000000000000000000000002"
PREDEPLOYED_EQUITY_FACTORY_ADDRESS="0x5e771e1417100000000000000000000000000003"
PREDEPLOYED_BOND_FACTORY_ADDRESS="0x5e771e1417100000000000000000000000000004"
PREDEPLOYED_FUND_FACTORY_ADDRESS="0x5e771e1417100000000000000000000000000005"
PREDEPLOYED_FIXED_YIELD_FACTORY_ADDRESS="0x5e771e1417100000000000000000000000000006"

# Check if the deployed addresses file exists
if [ ! -f "$DEPLOYED_ADDRESSES_PATH" ]; then
    echo "Using pre-deployed contracts (no deployed addresses file found at $DEPLOYED_ADDRESSES_PATH)"

    BOND_FACTORY_ADDRESS="$PREDEPLOYED_BOND_FACTORY_ADDRESS"
    CRYPTO_CURRENCY_FACTORY_ADDRESS="$PREDEPLOYED_CRYPTO_CURRENCY_FACTORY_ADDRESS"
    EQUITY_FACTORY_ADDRESS="$PREDEPLOYED_EQUITY_FACTORY_ADDRESS"
    STABLE_COIN_FACTORY_ADDRESS="$PREDEPLOYED_STABLE_COIN_FACTORY_ADDRESS"
    FIXED_YIELD_FACTORY_ADDRESS="$PREDEPLOYED_FIXED_YIELD_FACTORY_ADDRESS"
    FUND_FACTORY_ADDRESS="$PREDEPLOYED_FUND_FACTORY_ADDRESS"
else
    BOND_FACTORY_ADDRESS=$(jq -r '."BondFactoryModule#BondFactory"' "$DEPLOYED_ADDRESSES_PATH")
    CRYPTO_CURRENCY_FACTORY_ADDRESS=$(jq -r '."CryptoCurrencyFactoryModule#CryptoCurrencyFactory"' "$DEPLOYED_ADDRESSES_PATH")
    EQUITY_FACTORY_ADDRESS=$(jq -r '."EquityFactoryModule#EquityFactory"' "$DEPLOYED_ADDRESSES_PATH")
    STABLE_COIN_FACTORY_ADDRESS=$(jq -r '."StableCoinFactoryModule#StableCoinFactory"' "$DEPLOYED_ADDRESSES_PATH")
    FIXED_YIELD_FACTORY_ADDRESS=$(jq -r '."FixedYieldFactoryModule#FixedYieldFactory"' "$DEPLOYED_ADDRESSES_PATH")
    FUND_FACTORY_ADDRESS=$(jq -r '."FundFactoryModule#FundFactory"' "$DEPLOYED_ADDRESSES_PATH")
fi

# Ensure the directory exists
mkdir -p "$(dirname "$CONTRACTS_PATH")"

# Write contract addresses to contracts.ts
echo "import type { Address } from 'viem'

/**
 * Contract addresses for different factory contracts
 * These are dynamically populated based on the deployment chain
 */
export const BOND_FACTORY_ADDRESS = '$BOND_FACTORY_ADDRESS' as Address
export const CRYPTO_CURRENCY_FACTORY_ADDRESS = '$CRYPTO_CURRENCY_FACTORY_ADDRESS' as Address
export const EQUITY_FACTORY_ADDRESS = '$EQUITY_FACTORY_ADDRESS' as Address
export const STABLE_COIN_FACTORY_ADDRESS = '$STABLE_COIN_FACTORY_ADDRESS' as Address
export const FIXED_YIELD_FACTORY_ADDRESS = '$FIXED_YIELD_FACTORY_ADDRESS' as Address
export const FUND_FACTORY_ADDRESS = '$FUND_FACTORY_ADDRESS' as Address
" > "$CONTRACTS_PATH"

# Verify file was created
if [ ! -f "$CONTRACTS_PATH" ]; then
    echo "Error: Failed to create contracts.ts file"
    exit 1
fi

echo "Contract addresses successfully written to $CONTRACTS_PATH"


