#!/usr/bin/env bash -ex

# Get the absolute path of the script's directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ALL_ALLOCATIONS_FILE="${SCRIPT_DIR}/genesis-output.json"

rm -Rf "${ALL_ALLOCATIONS_FILE}"

declare -A CONTRACT_ADDRESSES
CONTRACT_ADDRESSES=(
    ["CryptoCurrencyFactory"]="0x5e771e1417100000000000000000000000000001"
    ["StableCoinFactory"]="0x5e771e1417100000000000000000000000000002"
    ["EquityFactory"]="0x5e771e1417100000000000000000000000000003"
    ["BondFactory"]="0x5e771e1417100000000000000000000000000004"
    ["FundFactory"]="0x5e771e1417100000000000000000000000000005"
    ["FixedYieldFactory"]="0x5e771e1417100000000000000000000000000006"
)

# Initialize an empty JSON object for all allocations
echo "{}" > "${ALL_ALLOCATIONS_FILE}"

# Function to process a single Solidity file
process_sol_file() {
    local sol_file="$1"
    local contract_name="$(basename "${sol_file%.*}")"
    local target_address


    target_address="${CONTRACT_ADDRESSES[$contract_name]}"

    local args_file="${sol_file%.*}.args"
    local forge_args=("${sol_file}:${contract_name}" --broadcast --unlocked --from "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" --json --rpc-url "http://localhost:8545")

    if [[ -f "$args_file" ]]; then
        # Read constructor args
        local CONSTRUCTOR_ARGS=$(cat "$args_file")
        forge_args+=(--constructor-args "$CONSTRUCTOR_ARGS")

        # Debug constructor args
        echo "Constructor args for $contract_name:"
        echo "$CONSTRUCTOR_ARGS"
    fi

    # Skip if the contract is not in the CONTRACT_ADDRESSES list
    if [[ -z "$target_address" ]]; then
        echo "Skipping $contract_name: Not in CONTRACT_ADDRESSES list"
        return
    fi

    # Add constructor args if they exist
    if [[ -f "$args_file" ]]; then
        forge_args+=(--constructor-args-path "$args_file")
    fi

    # Deploy the contract to a temporary blockchain
    local DEPLOYED_ADDRESS=$(forge create "${forge_args[@]}" | jq -r .deployedTo)
    if [[ -z "$DEPLOYED_ADDRESS" ]]; then
        echo "Error: Unable to deploy $contract_name"
        return
    fi

    # Get storage layout
    local STORAGE_LAYOUT=$(forge inspect "${sol_file}:${contract_name}" storageLayout --force --json)
    if [[ -z "$STORAGE_LAYOUT" ]]; then
        echo "Error: Unable to get storage layout for $contract_name"
        return
    fi

    # Process storage slots without using a pipe
    local STORAGE_JSON="{}"
    local slots=($(echo "$STORAGE_LAYOUT" | jq -r '.storage[] | .slot'))

    for slot in "${slots[@]}"; do
        local SLOT_VALUE=$(cast storage --rpc-url "http://localhost:8545" "$DEPLOYED_ADDRESS" "$slot")
        # Validate and pad if needed
        if [[ "$SLOT_VALUE" =~ ^0x ]]; then
            SLOT_VALUE="${SLOT_VALUE#0x}"  # Remove 0x prefix
            SLOT_VALUE=$(printf "%064s" "$SLOT_VALUE" | tr ' ' '0')  # Pad to 32 bytes
            SLOT_VALUE="0x$SLOT_VALUE"
        fi
        local padded_slot=$(printf "0x%064x" "$slot")
        STORAGE_JSON=$(echo "$STORAGE_JSON" | jq --arg slot "$padded_slot" --arg value "$SLOT_VALUE" '. + {($slot): $value}')
    done

    # Get bytecode from the deployed contract
    local BYTECODE=$(cast code --rpc-url "http://localhost:8545" "$DEPLOYED_ADDRESS" | sed 's/^0x//')
    if [[ -z "$BYTECODE" ]]; then
        echo "Error: Unable to get bytecode for deployed $contract_name"
        return
    fi

    # Use jq to add the contract allocation to the all_allocations.json file
    if ! jq --arg address "$target_address" \
       --arg bytecode "$BYTECODE" \
       --argjson storage "$STORAGE_JSON" \
       '. + {($address): {
         balance: "0x0",
         code: ("0x" + $bytecode),
         storage: $storage
       }}' "${ALL_ALLOCATIONS_FILE}" > "${SCRIPT_DIR}/temp.json"; then
        echo "Error: jq command failed for $contract_name"
        return
    fi
    mv "${SCRIPT_DIR}/temp.json" "${ALL_ALLOCATIONS_FILE}"

    echo "Added genesis configuration for $contract_name"
}

# Find all .sol files in the contracts directory and process them
for sol_file in contracts/*.sol; do
    # Skip if no files found
    [[ -f "$sol_file" ]] || continue
    process_sol_file "$sol_file"
done

echo "Complete genesis allocation has been written to ${ALL_ALLOCATIONS_FILE}"

cat "${ALL_ALLOCATIONS_FILE}"