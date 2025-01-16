#!/bin/bash

# Get the directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Construct full paths
CONTRACTS_PATH="$SCRIPT_DIR/src/lib/contracts.ts"
DEPLOYED_ADDRESSES_PATH="$SCRIPT_DIR/../contracts/ignition/deployments/chain-$1/deployed_addresses.json"

# Add error checking
if [ ! -f "$DEPLOYED_ADDRESSES_PATH" ]; then
    echo "Error: Deployment addresses file not found at $DEPLOYED_ADDRESSES_PATH"
    exit 1
fi

# Ensure the directory exists
mkdir -p "$(dirname "$CONTRACTS_PATH")"

# Fetch contract addresses from the deployment JSON and write to contracts.ts
echo "import type { Address } from 'viem'

/**
 * Contract addresses for different factory contracts
 * These are dynamically populated based on the deployment chain
 */
export const BOND_FACTORY_ADDRESS = '$(jq -r '."BondFactoryModule#BondFactory"' "$DEPLOYED_ADDRESSES_PATH")' as Address
export const CRYPTO_CURRENCY_FACTORY_ADDRESS = '$(jq -r '."CryptoCurrencyFactoryModule#CryptoCurrencyFactory"' "$DEPLOYED_ADDRESSES_PATH")' as Address
export const EQUITY_FACTORY_ADDRESS = '$(jq -r '."EquityFactoryModule#EquityFactory"' "$DEPLOYED_ADDRESSES_PATH")' as Address
export const STABLE_COIN_FACTORY_ADDRESS = '$(jq -r '."StableCoinFactoryModule#StableCoinFactory"' "$DEPLOYED_ADDRESSES_PATH")' as Address
" > "$CONTRACTS_PATH"

# Verify file was created
if [ ! -f "$CONTRACTS_PATH" ]; then
    echo "Error: Failed to create contracts.ts file"
    exit 1
fi

echo "Contract addresses successfully written to $CONTRACTS_PATH"


