#!/usr/bin/env bash

# genesis-output.sh - Robust genesis block generation script
# This script deploys contracts to a temporary blockchain and generates genesis allocations

# =============================================================================
# LIBRARY IMPORTS
# =============================================================================

# shellcheck disable=SC2154  # PROJECT_ROOT and SCRIPT_NAME are set by init_common_lib

# Get script directory and source libraries
declare SCRIPT_DIR
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR
source "${SCRIPT_DIR}/lib/all.sh"

# =============================================================================
# SCRIPT INITIALIZATION
# =============================================================================

# Initialize the common library
# shellcheck disable=SC2154
init_common_lib "genesis-output.sh"

# Validate required commands
validate_commands forge cast anvil jq

# =============================================================================
# SCRIPT-SPECIFIC VARIABLES
# =============================================================================

ANVIL_PORT="${ANVIL_PORT:-8545}"
ANVIL_BLOCK_TIME="${ANVIL_BLOCK_TIME:-1}"
FORCE_RESTART_ANVIL="${FORCE_RESTART_ANVIL:-false}"
KEEP_ANVIL_RUNNING="${KEEP_ANVIL_RUNNING:-false}"

# File paths
readonly ALL_ALLOCATIONS_FILE="${SCRIPT_DIR}/genesis-output.json"
readonly SECOND_OUTPUT_DIR="${SCRIPT_DIR}/../charts/atk/charts/besu-network/charts/besu-genesis/files"
readonly SECOND_OUTPUT_FILE="${SECOND_OUTPUT_DIR}/genesis-output.json"

# Contract configuration
declare -A CONTRACT_ADDRESSES
CONTRACT_ADDRESSES=(
    # Core infrastructure
    ["SMARTForwarder"]="0x5e771e1417100000000000000000000000020099"

    # System implementations
    ["SMARTComplianceImplementation"]="0x5e771e1417100000000000000000000000020001"
    ["SMARTIdentityRegistryImplementation"]="0x5e771e1417100000000000000000000000020002"
    ["SMARTIdentityRegistryStorageImplementation"]="0x5e771e1417100000000000000000000000020003"
    ["SMARTTrustedIssuersRegistryImplementation"]="0x5e771e1417100000000000000000000000020004"
    ["SMARTIdentityFactoryImplementation"]="0x5e771e1417100000000000000000000000020005"
    ["SMARTIdentityImplementation"]="0x5e771e1417100000000000000000000000020006"
    ["SMARTTokenIdentityImplementation"]="0x5e771e1417100000000000000000000000020007"
    ["SMARTTopicSchemeRegistryImplementation"]="0x5e771e1417100000000000000000000000020008"
    ["SMARTTokenAccessManagerImplementation"]="0x5e771e1417100000000000000000000000020009"

    # System factory
    ["SMARTSystemFactory"]="0x5e771e1417100000000000000000000000020088"

    # Asset implementations
    ["SMARTBondImplementation"]="0x5e771e1417100000000000000000000000020010"
    ["SMARTBondFactoryImplementation"]="0x5e771e1417100000000000000000000000020011"
    ["SMARTDepositImplementation"]="0x5e771e1417100000000000000000000000020012"
    ["SMARTDepositFactoryImplementation"]="0x5e771e1417100000000000000000000000020013"
    ["SMARTEquityImplementation"]="0x5e771e1417100000000000000000000000020014"
    ["SMARTEquityFactoryImplementation"]="0x5e771e1417100000000000000000000000020015"
    ["SMARTFundImplementation"]="0x5e771e1417100000000000000000000000020016"
    ["SMARTFundFactoryImplementation"]="0x5e771e1417100000000000000000000000020017"
    ["SMARTStableCoinImplementation"]="0x5e771e1417100000000000000000000000020018"
    ["SMARTStableCoinFactoryImplementation"]="0x5e771e1417100000000000000000000000020019"
)

declare -A CONTRACT_ARGS
CONTRACT_ARGS=(
    # SMARTForwarder has no constructor arguments

    # System implementations - all take forwarder as single argument
    ["SMARTComplianceImplementation"]="${CONTRACT_ADDRESSES["SMARTForwarder"]}"
    ["SMARTIdentityRegistryImplementation"]="${CONTRACT_ADDRESSES["SMARTForwarder"]}"
    ["SMARTIdentityRegistryStorageImplementation"]="${CONTRACT_ADDRESSES["SMARTForwarder"]}"
    ["SMARTTrustedIssuersRegistryImplementation"]="${CONTRACT_ADDRESSES["SMARTForwarder"]}"
    ["SMARTIdentityFactoryImplementation"]="${CONTRACT_ADDRESSES["SMARTForwarder"]}"
    ["SMARTIdentityImplementation"]="${CONTRACT_ADDRESSES["SMARTForwarder"]}"
    ["SMARTTokenIdentityImplementation"]="${CONTRACT_ADDRESSES["SMARTForwarder"]}"
    ["SMARTTopicSchemeRegistryImplementation"]="${CONTRACT_ADDRESSES["SMARTForwarder"]}"
    ["SMARTTokenAccessManagerImplementation"]="${CONTRACT_ADDRESSES["SMARTForwarder"]}"

    # System factory - takes all system contracts plus forwarder
    ["SMARTSystemFactory"]="${CONTRACT_ADDRESSES["SMARTComplianceImplementation"]} ${CONTRACT_ADDRESSES["SMARTIdentityRegistryImplementation"]} ${CONTRACT_ADDRESSES["SMARTIdentityRegistryStorageImplementation"]} ${CONTRACT_ADDRESSES["SMARTTrustedIssuersRegistryImplementation"]} ${CONTRACT_ADDRESSES["SMARTTopicSchemeRegistryImplementation"]} ${CONTRACT_ADDRESSES["SMARTIdentityFactoryImplementation"]} ${CONTRACT_ADDRESSES["SMARTIdentityImplementation"]} ${CONTRACT_ADDRESSES["SMARTTokenIdentityImplementation"]} ${CONTRACT_ADDRESSES["SMARTTokenAccessManagerImplementation"]} ${CONTRACT_ADDRESSES["SMARTForwarder"]}"

    # Asset implementations - all take forwarder as single argument
    ["SMARTBondImplementation"]="${CONTRACT_ADDRESSES["SMARTForwarder"]}"
    ["SMARTBondFactoryImplementation"]="${CONTRACT_ADDRESSES["SMARTForwarder"]}"
    ["SMARTDepositImplementation"]="${CONTRACT_ADDRESSES["SMARTForwarder"]}"
    ["SMARTDepositFactoryImplementation"]="${CONTRACT_ADDRESSES["SMARTForwarder"]}"
    ["SMARTEquityImplementation"]="${CONTRACT_ADDRESSES["SMARTForwarder"]}"
    ["SMARTEquityFactoryImplementation"]="${CONTRACT_ADDRESSES["SMARTForwarder"]}"
    ["SMARTFundImplementation"]="${CONTRACT_ADDRESSES["SMARTForwarder"]}"
    ["SMARTFundFactoryImplementation"]="${CONTRACT_ADDRESSES["SMARTForwarder"]}"
    ["SMARTStableCoinImplementation"]="${CONTRACT_ADDRESSES["SMARTForwarder"]}"
    ["SMARTStableCoinFactoryImplementation"]="${CONTRACT_ADDRESSES["SMARTForwarder"]}"
)

# Contract file locations mapping
declare -A CONTRACT_FILES
CONTRACT_FILES=(
    # Core infrastructure
    ["SMARTForwarder"]="contracts/vendor/SMARTForwarder.sol"

    # System implementations
    ["SMARTComplianceImplementation"]="contracts/system/compliance/SMARTComplianceImplementation.sol"
    ["SMARTIdentityRegistryImplementation"]="contracts/system/identity-registry/SMARTIdentityRegistryImplementation.sol"
    ["SMARTIdentityRegistryStorageImplementation"]="contracts/system/identity-registry-storage/SMARTIdentityRegistryStorageImplementation.sol"
    ["SMARTTrustedIssuersRegistryImplementation"]="contracts/system/trusted-issuers-registry/SMARTTrustedIssuersRegistryImplementation.sol"
    ["SMARTIdentityFactoryImplementation"]="contracts/system/identity-factory/SMARTIdentityFactoryImplementation.sol"
    ["SMARTIdentityImplementation"]="contracts/system/identity-factory/identities/SMARTIdentityImplementation.sol"
    ["SMARTTokenIdentityImplementation"]="contracts/system/identity-factory/identities/SMARTTokenIdentityImplementation.sol"
    ["SMARTTopicSchemeRegistryImplementation"]="contracts/system/topic-scheme-registry/SMARTTopicSchemeRegistryImplementation.sol"
    ["SMARTTokenAccessManagerImplementation"]="contracts/system/access-manager/SMARTTokenAccessManagerImplementation.sol"

    # System factory
    ["SMARTSystemFactory"]="contracts/system/SMARTSystemFactory.sol"

    # Asset implementations
    ["SMARTBondImplementation"]="contracts/assets/bond/SMARTBondImplementation.sol"
    ["SMARTBondFactoryImplementation"]="contracts/assets/bond/SMARTBondFactoryImplementation.sol"
    ["SMARTDepositImplementation"]="contracts/assets/deposit/SMARTDepositImplementation.sol"
    ["SMARTDepositFactoryImplementation"]="contracts/assets/deposit/SMARTDepositFactoryImplementation.sol"
    ["SMARTEquityImplementation"]="contracts/assets/equity/SMARTEquityImplementation.sol"
    ["SMARTEquityFactoryImplementation"]="contracts/assets/equity/SMARTEquityFactoryImplementation.sol"
    ["SMARTFundImplementation"]="contracts/assets/fund/SMARTFundImplementation.sol"
    ["SMARTFundFactoryImplementation"]="contracts/assets/fund/SMARTFundFactoryImplementation.sol"
    ["SMARTStableCoinImplementation"]="contracts/assets/stable-coin/SMARTStableCoinImplementation.sol"
    ["SMARTStableCoinFactoryImplementation"]="contracts/assets/stable-coin/SMARTStableCoinFactoryImplementation.sol"
)

# Process tracking
declare -i CONTRACTS_PROCESSED=0
declare -i CONTRACTS_SKIPPED=0
declare -i CONTRACTS_FAILED=0

# =============================================================================
# SCRIPT-SPECIFIC FUNCTIONS
# =============================================================================

# Register Anvil cleanup for this script
register_anvil_cleanup

# Script-specific cleanup function
script_cleanup() {
    local exit_code="$1"
    
    # Clean up temporary files
    rm -f "${SCRIPT_DIR}"/temp_*_args.txt
    
    if [[ ${exit_code} -eq 0 ]]; then
        log_info "Processing summary: ${CONTRACTS_PROCESSED} processed, ${CONTRACTS_SKIPPED} skipped, ${CONTRACTS_FAILED} failed"
        if [[ "${KEEP_ANVIL_RUNNING}" != "true" ]]; then
            cleanup_anvil
        fi
    else
        cleanup_anvil
    fi
}

# Custom Anvil startup for this script
start_custom_anvil() {
    if start_anvil "${ANVIL_PORT}" "${ANVIL_BLOCK_TIME}" "${FORCE_RESTART_ANVIL}"; then
        sleep 2
        return 0
    else
        log_error "Failed to start Anvil using library function"
        return 1
    fi
}

initialize_genesis_file() {
    log_info "Initializing genesis allocation file..."

    # Remove existing file if it exists
    if [[ -f "${ALL_ALLOCATIONS_FILE}" ]]; then
        rm -f "${ALL_ALLOCATIONS_FILE}"
        log_debug "Removed existing genesis file"
    fi

    # Initialize empty JSON object
    echo "{}" > "${ALL_ALLOCATIONS_FILE}"
    log_success "Genesis allocation file initialized"
}

validate_contract_bytecode() {
    local sol_file="$1"
    local contract_name="$2"

    log_debug "Validating bytecode for ${contract_name}..."

    local bytecode
    if ! bytecode=$(forge inspect "${sol_file}:${contract_name}" bytecode 2>&1); then
        log_error "Error getting bytecode for ${contract_name}: ${bytecode}"
        return 1
    fi

    local bytecode_size=$((${#bytecode} / 2 - 1))  # Divide by 2 because hex, subtract 1 for '0x'
    local max_size=24576  # 24KB EIP-170 limit

    log_debug "Contract ${contract_name} bytecode size: ${bytecode_size} bytes"

    if [[ ${bytecode_size} -gt ${max_size} ]]; then
        log_error "Contract ${contract_name} bytecode size (${bytecode_size} bytes) exceeds ${max_size} bytes EIP-170 limit"
        log_error "Try using a proxy pattern or optimizing the contract"
        return 1
    fi

    return 0
}

deploy_contract_genesis() {
    local sol_file="$1"
    local contract_name="$2"

    log_info "Deploying ${contract_name}..."

    # Check for constructor args file
    local args_file="${sol_file%.*}.args"

    # Build forge arguments
    local forge_args=(
        "${sol_file}:${contract_name}"
        --broadcast
        --unlocked
        --from "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
        --json
        --rpc-url "http://localhost:${ANVIL_PORT}"
        --optimize
        --optimizer-runs 200
    )

    # Add constructor args if they exist
    if [[ -f "${args_file}" ]]; then
        forge_args+=(--constructor-args-path "${args_file}")
        log_debug "Using constructor args from: ${args_file}"
    elif [[ -n "${CONTRACT_ARGS[${contract_name}]:-}" ]]; then
        # For SMARTSystemFactory, create a temporary args file due to complex args
        if [[ "${contract_name}" == "SMARTSystemFactory" ]]; then
            local temp_args_file="${SCRIPT_DIR}/temp_${contract_name}_args.txt"
            echo "${CONTRACT_ARGS[${contract_name}]}" > "${temp_args_file}"
            forge_args+=(--constructor-args-path "${temp_args_file}")
            log_debug "Using constructor args file for ${contract_name}"
        else
            # Single argument contracts
            forge_args+=(--constructor-args "${CONTRACT_ARGS[${contract_name}]}")
            log_debug "Using predefined constructor args"
        fi
    fi

    # Deploy the contract
    local deploy_output
    if ! deploy_output=$(forge create "${forge_args[@]}" 2>&1); then
        log_error "Failed to deploy ${contract_name}:"
        echo "${deploy_output}" >&2
        return 1
    fi

    # Parse deployed address
    local deployed_address
    if ! deployed_address=$(echo "${deploy_output}" | jq -r .deployedTo 2>/dev/null); then
        log_error "Error parsing deployment output for ${contract_name}:"
        echo "${deploy_output}" >&2
        return 1
    fi

    if [[ -z "${deployed_address}" || "${deployed_address}" == "null" ]]; then
        log_error "Unable to get deployed address for ${contract_name}"
        echo "Deploy output: ${deploy_output}" >&2
        return 1
    fi

    log_success "${contract_name} deployed to: ${deployed_address}"
    echo "${deployed_address}"
}

get_storage_layout() {
    local sol_file="$1"
    local contract_name="$2"
    local deployed_address="$3"

    log_debug "Getting storage layout for ${contract_name}..."

    # Get storage layout from contract
    local storage_layout
    if ! storage_layout=$(forge inspect "${sol_file}:${contract_name}" storageLayout --force --json 2>&1); then
        log_error "Error getting storage layout for ${contract_name}: ${storage_layout}"
        return 1
    fi

    # Process storage slots
    local storage_json="{}"
    local slots
    if ! mapfile -t slots < <(echo "${storage_layout}" | jq -r '.storage[] | .slot' 2>/dev/null || true); then
        log_warn "No storage slots found for ${contract_name}"
        echo "${storage_json}"
        return 0
    fi

    for slot in "${slots[@]}"; do
        local slot_value
        if ! slot_value=$(cast storage --rpc-url "http://localhost:${ANVIL_PORT}" "${deployed_address}" "${slot}" 2>&1); then
            log_warn "Error reading storage slot ${slot} for ${contract_name}: ${slot_value}"
            continue
        fi

        # Validate and pad if needed
        if [[ "${slot_value}" =~ ^0x ]]; then
            slot_value="${slot_value#0x}"  # Remove 0x prefix
            slot_value=$(printf "%064s" "${slot_value}" | tr ' ' '0')  # Pad to 32 bytes
            slot_value="0x${slot_value}"
        fi

        local padded_slot
        padded_slot=$(printf "0x%064x" "${slot}")
        storage_json=$(echo "${storage_json}" | jq --arg slot "${padded_slot}" --arg value "${slot_value}" '. + {($slot): $value}')
    done

    echo "${storage_json}"
}

get_deployed_bytecode() {
    local contract_name="$1"
    local deployed_address="$2"

    log_debug "Getting deployed bytecode for ${contract_name}..."

    local bytecode
    if ! bytecode=$(cast code --rpc-url "http://localhost:${ANVIL_PORT}" "${deployed_address}" 2>&1); then
        log_error "Error getting deployed bytecode for ${contract_name}: ${bytecode}"
        return 1
    fi

    # Remove 0x prefix for consistency
    bytecode="${bytecode#0x}"

    if [[ -z "${bytecode}" ]]; then
        log_error "Empty bytecode for deployed ${contract_name}"
        return 1
    fi

    echo "${bytecode}"
}

add_to_genesis() {
    local contract_name="$1"
    local target_address="$2"
    local bytecode="$3"
    local storage_json="$4"

    log_debug "Adding ${contract_name} to genesis allocation..."

    # Use jq to add the contract allocation to the genesis file
    local temp_file="${SCRIPT_DIR}/temp.json"
    if ! jq --arg address "${target_address}" \
       --arg bytecode "${bytecode}" \
       --argjson storage "${storage_json}" \
       '. + {($address): {
         balance: "0x0",
         code: ("0x" + $bytecode),
         storage: $storage
       }}' "${ALL_ALLOCATIONS_FILE}" > "${temp_file}"; then
        log_error "jq command failed for ${contract_name}"
        rm -f "${temp_file}"
        return 1
    fi

    mv "${temp_file}" "${ALL_ALLOCATIONS_FILE}"
    log_success "Added ${contract_name} to genesis allocation"
}

process_contract() {
    local sol_file="$1"
    local contract_name="$2"
    local total_contracts="${3:-21}"  # Default to 21 if not provided

    # If contract name not provided, derive from filename
    if [[ -z "${contract_name}" ]]; then
        contract_name="$(basename "${sol_file%.*}")"
    fi

    # Check if contract is in the addresses list
    local target_address="${CONTRACT_ADDRESSES[${contract_name}]:-}"
    if [[ -z "${target_address}" ]]; then
        log_debug "Skipping ${contract_name}: Not in CONTRACT_ADDRESSES list"
        CONTRACTS_SKIPPED=$((CONTRACTS_SKIPPED + 1))
        return 0
    fi

    # Show progress
    local progress_pct=$(( (CONTRACTS_PROCESSED + CONTRACTS_FAILED + CONTRACTS_SKIPPED) * 100 / total_contracts ))
    log_info "[${progress_pct}%] Processing ${contract_name}..."

    # Validate bytecode size
    if ! validate_contract_bytecode "${sol_file}" "${contract_name}"; then
        CONTRACTS_FAILED=$((CONTRACTS_FAILED + 1))
        return 1
    fi

    # Deploy contract
    local deployed_address
    if ! deployed_address=$(deploy_contract_genesis "${sol_file}" "${contract_name}"); then
        CONTRACTS_FAILED=$((CONTRACTS_FAILED + 1))
        return 1
    fi

    # Get storage layout
    local storage_json
    if ! storage_json=$(get_storage_layout "${sol_file}" "${contract_name}" "${deployed_address}"); then
        CONTRACTS_FAILED=$((CONTRACTS_FAILED + 1))
        return 1
    fi

    # Get deployed bytecode
    local bytecode
    if ! bytecode=$(get_deployed_bytecode "${contract_name}" "${deployed_address}"); then
        CONTRACTS_FAILED=$((CONTRACTS_FAILED + 1))
        return 1
    fi

    # Add to genesis file
    if ! add_to_genesis "${contract_name}" "${target_address}" "${bytecode}" "${storage_json}"; then
        CONTRACTS_FAILED=$((CONTRACTS_FAILED + 1))
        return 1
    fi

    CONTRACTS_PROCESSED=$((CONTRACTS_PROCESSED + 1))
    log_success "Successfully processed ${contract_name}"
}

process_all_contracts() {
    log_info "Processing all contracts..."

    # Get total number of contracts to process
    local total_contracts=${#CONTRACT_ADDRESSES[@]}
    log_info "Found ${total_contracts} contract(s) to process"

    # Process contracts in deployment order
    # 1. First deploy SMARTForwarder (no dependencies)
    if [[ -n "${CONTRACT_ADDRESSES["SMARTForwarder"]:-}" ]]; then
        local sol_file="${PROJECT_ROOT}/${CONTRACT_FILES["SMARTForwarder"]}"
        if ! process_contract "${sol_file}" "SMARTForwarder" "${total_contracts}"; then
            log_error "Failed to process SMARTForwarder - cannot continue"
            return 1
        fi
    fi

    # 2. Then deploy all other contracts (they depend on forwarder)
    for contract_name in "${!CONTRACT_ADDRESSES[@]}"; do
        # Skip forwarder as it's already processed
        if [[ "${contract_name}" == "SMARTForwarder" ]]; then
            continue
        fi

        # Get the sol file path
        local sol_file="${PROJECT_ROOT}/${CONTRACT_FILES[${contract_name}]}"

        if [[ ! -f "${sol_file}" ]]; then
            log_error "Contract file not found: ${sol_file}"
            CONTRACTS_FAILED=$((CONTRACTS_FAILED + 1))
            continue
        fi

        if ! process_contract "${sol_file}" "${contract_name}" "${total_contracts}"; then
            log_debug "Error processing: ${contract_name}"
        fi
    done

    if [[ ${CONTRACTS_PROCESSED} -eq 0 ]]; then
        log_warn "No contracts were processed successfully"
        return 1
    fi
}

verify_all_contracts_processed() {
    log_info "Verifying all contracts were processed..."
    
    local missing_contracts=()
    local expected_total=${#CONTRACT_ADDRESSES[@]}
    
    # Check if genesis file exists
    if [[ ! -f "${ALL_ALLOCATIONS_FILE}" ]]; then
        log_error "Genesis file not found: ${ALL_ALLOCATIONS_FILE}"
        return 1
    fi
    
    # Validate JSON structure
    if ! jq empty "${ALL_ALLOCATIONS_FILE}" 2>/dev/null; then
        log_error "Genesis file contains invalid JSON"
        return 1
    fi
    
    # Get all addresses from the genesis file
    local genesis_addresses
    if ! genesis_addresses=$(jq -r 'keys[]' "${ALL_ALLOCATIONS_FILE}" 2>/dev/null); then
        log_error "Failed to parse genesis file"
        return 1
    fi
    
    # Check each expected contract address
    for contract_name in "${!CONTRACT_ADDRESSES[@]}"; do
        local expected_address="${CONTRACT_ADDRESSES[${contract_name}]}"
        
        # Check if this address exists in the genesis file
        if ! echo "${genesis_addresses}" | grep -qi "^${expected_address}$"; then
            missing_contracts+=("${contract_name} (${expected_address})")
        fi
    done
    
    # Report results
    local processed_count
    processed_count=$(echo "${genesis_addresses}" | wc -l | tr -d ' ')
    log_info "Expected contracts: ${expected_total}"
    log_info "Processed contracts: ${processed_count}"
    
    if [[ ${#missing_contracts[@]} -gt 0 ]]; then
        log_error "The following contracts are missing from the genesis file:"
        for contract in "${missing_contracts[@]}"; do
            log_error "  - ${contract}"
        done
        return 1
    fi
    
    log_success "All ${expected_total} contracts were successfully processed!"
    return 0
}

copy_to_second_location() {
    log_info "Copying genesis allocation to second location..."

    # Create the second output directory if it doesn't exist
    if ! mkdir -p "${SECOND_OUTPUT_DIR}"; then
        log_error "Failed to create second output directory: ${SECOND_OUTPUT_DIR}"
        return 1
    fi

    # Copy the file
    if cp "${ALL_ALLOCATIONS_FILE}" "${SECOND_OUTPUT_FILE}"; then
        log_success "Successfully copied genesis allocation to: ${SECOND_OUTPUT_FILE}"
    else
        log_error "Failed to copy genesis allocation to second location"
        return 1
    fi
}

show_usage() {
    cat << EOF
Usage: ${SCRIPT_NAME} [OPTIONS]

This script deploys contracts to a temporary blockchain and generates genesis allocations.

OPTIONS:
    -h, --help              Show this help message
    -v, --verbose           Enable verbose logging (DEBUG level)
    -q, --quiet             Enable quiet mode (ERROR level only)
    -p, --port PORT         Set Anvil port (default: 8545)
    -b, --block-time TIME   Set Anvil block time in seconds (default: 1)
    -r, --restart-anvil     Force restart Anvil if already running
    -k, --keep-anvil        Keep Anvil running after script completion
    --show-output           Display final genesis JSON output

ENVIRONMENT VARIABLES:
    LOG_LEVEL               Set logging level (DEBUG, INFO, WARN, ERROR)
    ANVIL_PORT              Set Anvil port
    ANVIL_BLOCK_TIME        Set Anvil block time
    FORCE_RESTART_ANVIL     Set to 'true' to restart Anvil
    KEEP_ANVIL_RUNNING      Set to 'true' to keep Anvil running

EXAMPLES:
    ${SCRIPT_NAME}                    # Run with default settings
    ${SCRIPT_NAME} --verbose          # Run with verbose output
    ${SCRIPT_NAME} -p 8546            # Use port 8546 for Anvil
    ${SCRIPT_NAME} --restart-anvil    # Force restart Anvil
    ${SCRIPT_NAME} --keep-anvil       # Keep Anvil running after completion

PREREQUISITES:
    - Forge project with foundry.toml or forge.toml
    - Compiled contracts (run 'forge build' first)
    - Foundry toolchain (forge, cast, anvil)
    - jq command installed

EOF
}

parse_arguments() {
    local show_output=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -v|--verbose)
                export LOG_LEVEL="DEBUG"
                log_info "Verbose mode enabled"
                ;;
            -q|--quiet)
                export LOG_LEVEL="ERROR"
                ;;
            -p|--port)
                if [[ -n "${2-}" ]] && [[ "${2}" =~ ^[0-9]+$ ]]; then
                    ANVIL_PORT="$2"
                    log_info "Anvil port set to: ${ANVIL_PORT}"
                    shift
                else
                    log_error "Option --port requires a valid port number"
                    exit 1
                fi
                ;;
            -b|--block-time)
                if [[ -n "${2-}" ]] && [[ "${2}" =~ ^[0-9]+$ ]]; then
                    ANVIL_BLOCK_TIME="$2"
                    log_info "Anvil block time set to: ${ANVIL_BLOCK_TIME} seconds"
                    shift
                else
                    log_error "Option --block-time requires a valid number"
                    exit 1
                fi
                ;;
            -r|--restart-anvil)
                FORCE_RESTART_ANVIL="true"
                log_info "Force restart Anvil mode enabled"
                ;;
            -k|--keep-anvil)
                KEEP_ANVIL_RUNNING="true"
                log_info "Keep Anvil running mode enabled"
                ;;
            --show-output)
                show_output=true
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
        shift
    done

    # Export show_output for use in main
    export SHOW_OUTPUT="${show_output}"
}

main() {
    log_info "Starting ${SCRIPT_NAME}..."
    log_info "Script directory: ${SCRIPT_DIR}"
    log_info "Project root: ${PROJECT_ROOT}"
    log_info "Anvil port: ${ANVIL_PORT}"

    # Parse command line arguments
    parse_arguments "$@"

    # Validate environment
    validate_forge_environment

    # Start Anvil
    start_custom_anvil

    # Initialize genesis file
    initialize_genesis_file

    # Process all contracts
    process_all_contracts

    # Verify all contracts were processed
    if ! verify_all_contracts_processed; then
        log_error "Genesis generation incomplete - not all contracts were processed"
        exit 1
    fi

    # Copy to second location
    copy_to_second_location

    log_success "Genesis generation completed successfully!"
    log_info "Genesis allocation written to: ${ALL_ALLOCATIONS_FILE}"
    log_info "Also copied to: ${SECOND_OUTPUT_FILE}"

    # Show output if requested
    if [[ "${SHOW_OUTPUT:-false}" == "true" ]]; then
        echo "=== GENESIS OUTPUT ===" >&2
        cat "${ALL_ALLOCATIONS_FILE}"
    fi
}

# Only run main if script is executed directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi