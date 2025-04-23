#!/usr/bin/env bash -e

# Get the absolute path of the script's directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ALL_ALLOCATIONS_FILE="${SCRIPT_DIR}/genesis-output.json"
# Define the second output location relative to the script directory
SECOND_OUTPUT_DIR="${SCRIPT_DIR}/../charts/atk/charts/besu-network/charts/besu-genesis/files"
SECOND_OUTPUT_FILE="${SECOND_OUTPUT_DIR}/genesis-output.json"

# Check if anvil is running, if not start it
if ! nc -z localhost 8545 2>/dev/null; then
    echo "Starting Anvil..."
    anvil --block-time 1 > /dev/null 2>&1 &
    ANVIL_PID=$!
    # Wait for anvil to start
    sleep 2
    echo "Anvil started with PID: $ANVIL_PID"
fi

rm -Rf "${ALL_ALLOCATIONS_FILE}"

declare -A CONTRACT_ADDRESSES
CONTRACT_ADDRESSES=(
    ["Forwarder"]="0x5e771e1417100000000000000000000000000099"

    ["CryptoCurrencyFactory"]="0x5e771e1417100000000000000000000000000001"
    ["StableCoinFactory"]="0x5e771e1417100000000000000000000000000002"
    ["EquityFactory"]="0x5e771e1417100000000000000000000000000003"
    ["BondFactory"]="0x5e771e1417100000000000000000000000000004"
    ["FundFactory"]="0x5e771e1417100000000000000000000000000005"
    ["FixedYieldFactory"]="0x5e771e1417100000000000000000000000000006"
    ["DepositFactory"]="0x5e771e1417100000000000000000000000000007"
    ["DvPSwapFactory"]="0x5e771e1417100000000000000000000000000008"
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

    # Skip if the contract is not in the CONTRACT_ADDRESSES list
    if [[ -z "$target_address" ]]; then
        echo "Skipping $contract_name: Not in CONTRACT_ADDRESSES list"
        return
    fi

    echo "Processing $contract_name..."

    # Print contract size before deployment
    echo "Checking size for $contract_name..."
    local CONTRACT_BYTECODE
    if ! CONTRACT_BYTECODE=$(forge inspect "${sol_file}:${contract_name}" bytecode 2>&1); then
        echo "Error getting bytecode for $contract_name: $CONTRACT_BYTECODE"
        return
    fi

    local BYTECODE_SIZE=$((${#CONTRACT_BYTECODE} / 2 - 1))  # Divide by 2 because hex, subtract 1 for '0x'
    echo "Contract $contract_name bytecode size: $BYTECODE_SIZE bytes"

    # if [ $BYTECODE_SIZE -gt 24576 ]; then  # 24KB = 24576 bytes (EIP-170 limit)
    #     echo "Error: $contract_name bytecode size ($BYTECODE_SIZE bytes) exceeds 24KB EIP-170 limit"
    #     echo "Try using a proxy pattern or optimizing the contract"
    #     return
    # fi

    # Build forge arguments
    local forge_args=(
        "${sol_file}:${contract_name}"
        --broadcast
        --unlocked
        --from "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
        --json
        --rpc-url "http://localhost:8545"
        --optimize
        --optimizer-runs 200
    )

    # Add constructor args if they exist
    if [[ -f "$args_file" ]]; then
        forge_args+=(--constructor-args-path "$args_file")
    fi

    # Deploy the contract to a temporary blockchain
    echo "Deploying $contract_name..."
    local DEPLOY_OUTPUT
    if ! DEPLOY_OUTPUT=$(forge create "${forge_args[@]}" 2>&1); then
        echo "Error deploying $contract_name:"
        echo "$DEPLOY_OUTPUT"
        return
    fi

    local DEPLOYED_ADDRESS
    if ! DEPLOYED_ADDRESS=$(echo "$DEPLOY_OUTPUT" | jq -r .deployedTo 2>/dev/null); then
        echo "Error parsing deployment output for $contract_name:"
        echo "$DEPLOY_OUTPUT"
        return
    fi

    if [[ -z "$DEPLOYED_ADDRESS" || "$DEPLOYED_ADDRESS" == "null" ]]; then
        echo "Error: Unable to get deployed address for $contract_name"
        echo "Deploy output: $DEPLOY_OUTPUT"
        return
    fi

    echo "$contract_name deployed to: $DEPLOYED_ADDRESS"

    # Get storage layout
    local STORAGE_LAYOUT
    if ! STORAGE_LAYOUT=$(forge inspect "${sol_file}:${contract_name}" storageLayout --force --json 2>&1); then
        echo "Error getting storage layout for $contract_name: $STORAGE_LAYOUT"
        return
    fi

    # Process storage slots without using a pipe
    local STORAGE_JSON="{}"
    local slots
    if ! slots=($(echo "$STORAGE_LAYOUT" | jq -r '.storage[] | .slot' 2>/dev/null)); then
        echo "Error processing storage slots for $contract_name"
        return
    fi

    for slot in "${slots[@]}"; do
        local SLOT_VALUE
        if ! SLOT_VALUE=$(cast storage --rpc-url "http://localhost:8545" "$DEPLOYED_ADDRESS" "$slot" 2>&1); then
            echo "Error reading storage slot $slot for $contract_name: $SLOT_VALUE"
            continue
        fi

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
    local BYTECODE
    if ! BYTECODE=$(cast code --rpc-url "http://localhost:8545" "$DEPLOYED_ADDRESS" 2>&1 | sed 's/^0x//'); then
        echo "Error getting deployed bytecode for $contract_name: $BYTECODE"
        return
    fi

    if [[ -z "$BYTECODE" ]]; then
        echo "Error: Empty bytecode for deployed $contract_name"
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

# Create the second output directory if it doesn't exist and copy the file
echo "Copying genesis allocation to ${SECOND_OUTPUT_FILE}..."
mkdir -p "${SECOND_OUTPUT_DIR}"
cp "${ALL_ALLOCATIONS_FILE}" "${SECOND_OUTPUT_FILE}"
echo "Successfully copied genesis allocation to second location."

# Kill anvil if we started it
if [[ -n "$ANVIL_PID" ]]; then
    kill $ANVIL_PID
fi

cat "${ALL_ALLOCATIONS_FILE}"