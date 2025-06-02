#!/usr/bin/env bash

# contracts.sh - Contract-specific utilities for tool scripts
# This library provides contract processing and deployment functionality

# Source common library if not already loaded
if [[ "${_COMMON_LIB_LOADED:-}" != "1" ]]; then
    source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh" || { echo "ERROR: Unable to load common.sh" >&2; return 1; }
fi

# Prevent multiple sourcing
if [[ "${_CONTRACTS_LIB_LOADED:-}" == "1" ]]; then
    return 0
fi
readonly _CONTRACTS_LIB_LOADED=1

# =============================================================================
# CONTRACT METADATA OPERATIONS
# =============================================================================

# Validate contract metadata file
validate_metadata_file() {
    local metadata_file="$1"
    local contract_name="$2"

    if [[ ! -f "${metadata_file}" ]]; then
        log_warn "Metadata file not found for ${contract_name}: ${metadata_file}"
        return 1
    fi

    # Validate JSON format
    if ! jq empty "${metadata_file}" 2>/dev/null; then
        log_warn "Invalid JSON format in metadata file: ${metadata_file}"
        return 1
    fi

    # Check if file has essential fields
    if ! jq -e '.abi' "${metadata_file}" >/dev/null 2>&1; then
        log_warn "Metadata file missing ABI field: ${metadata_file}"
        return 1
    fi

    return 0
}

# Check if a Solidity file contains a deployable contract
has_deployable_contract() {
    local sol_file="$1"

    # Check if file contains 'contract', 'interface', or 'library' keywords
    # but exclude pure error definitions, struct definitions, and enum definitions
    if grep -E -q "^[[:space:]]*contract[[:space:]]+|^[[:space:]]*interface[[:space:]]+|^[[:space:]]*library[[:space:]]+" "${sol_file}"; then
        return 0
    fi

    return 1
}

# Process contract metadata file
process_contract_metadata() {
    local contract_file="$1"
    local output_dir="$2"
    local force_overwrite="${3:-false}"
    local base_name
    base_name="$(basename "${contract_file}" .sol)"
    local metadata_file="${PROJECT_ROOT}/out/${base_name}.sol/${base_name}.json"
    local output_file="${output_dir}/${base_name}.json"

    log_debug "Processing contract metadata: ${base_name}"

    # Check if file contains a deployable contract before looking for metadata
    if ! has_deployable_contract "${contract_file}"; then
        log_debug "Skipping ${base_name} - no deployable contract found"
        return 2  # Return 2 to indicate "skipped" rather than error
    fi

    # Validate metadata file
    if ! validate_metadata_file "${metadata_file}" "${base_name}"; then
        return 1
    fi

    # Check if output file exists and handle force overwrite
    if [[ -f "${output_file}" ]] && [[ "${force_overwrite}" != "true" ]]; then
        # Compare files to see if they're different
        if command_exists "diff" && diff -q "${metadata_file}" "${output_file}" >/dev/null 2>&1; then
            log_debug "Output file identical to source, skipping: ${base_name}"
            return 2  # Special return code for "skipped"
        fi

        log_warn "Output file already exists: ${output_file}"
        log_info "Use --force to overwrite existing files"
        return 1
    fi

    # Copy metadata file
    if cp "${metadata_file}" "${output_file}"; then
        log_info "Processed ${base_name}"

        # Validate copied file
        if ! jq empty "${output_file}" 2>/dev/null; then
            log_error "Copied file is not valid JSON: ${output_file}"
            rm -f "${output_file}"
            return 1
        fi
        return 0
    else
        log_error "Failed to copy metadata for ${base_name}"
        return 1
    fi
}

# Process all contract metadata files
process_all_contract_metadata() {
    local output_dir="$1"
    local force_overwrite="${2:-false}"
    local contracts_dir="${PROJECT_ROOT}/contracts"

    log_info "Processing contract metadata files..."

    local sol_files=()
    local processed_count=0
    local skipped_count=0
    local error_count=0

    # Find all .sol files
    while IFS= read -r -d '' file; do
        sol_files+=("$file")
    done < <(find_files "${contracts_dir}" "*.sol")

    if [[ ${#sol_files[@]} -eq 0 ]]; then
        log_warn "No .sol files found in ${contracts_dir}"
        return 0
    fi

    log_info "Found ${#sol_files[@]} contract file(s) to process"

    # Process each contract
    for contract_file in "${sol_files[@]}"; do
        case $(process_contract_metadata "${contract_file}" "${output_dir}" "${force_overwrite}"; echo $?) in
            0)
                processed_count=$((processed_count + 1))
                ;;
            1)
                error_count=$((error_count + 1))
                ;;
            2)
                skipped_count=$((skipped_count + 1))
                ;;
        esac
    done

    if [[ ${processed_count} -gt 0 ]]; then
        log_success "Successfully processed ${processed_count} contract metadata file(s)"
    fi

    if [[ ${skipped_count} -gt 0 ]]; then
        log_info "${skipped_count} file(s) were skipped (no deployable contracts)"
    fi

    if [[ ${error_count} -gt 0 ]]; then
        log_warn "${error_count} error(s) occurred during processing"
        return 1
    fi

    return 0
}

# Clean output directory
clean_output_directory() {
    local output_path="$1"

    log_info "Cleaning output directory: ${output_path}"

    if [[ ! -d "${output_path}" ]]; then
        log_debug "Output directory does not exist, nothing to clean"
        return 0
    fi

    # Find and count existing .json files
    local existing_files=()
    while IFS= read -r -d '' file; do
        existing_files+=("$file")
    done < <(find_files "${output_path}" "*.json")

    if [[ ${#existing_files[@]} -eq 0 ]]; then
        log_info "No existing metadata files to clean"
        return 0
    fi

    log_info "Found ${#existing_files[@]} existing metadata file(s) to remove"

    # Remove existing .json files
    local removed_count=0
    for file in "${existing_files[@]}"; do
        local relative_path="${file#"${output_path}"/}"
        if rm -f "${file}"; then
            log_debug "Removed: ${relative_path}"
            removed_count=$((removed_count + 1))
        else
            log_warn "Failed to remove: ${relative_path}"
        fi
    done

    if [[ ${removed_count} -gt 0 ]]; then
        log_success "Cleaned ${removed_count} existing metadata file(s)"
    fi
}

# =============================================================================
# CONTRACT DEPLOYMENT AND VALIDATION
# =============================================================================

# Validate contract bytecode size
validate_contract_bytecode() {
    local sol_file="$1"
    local contract_name="$2"

    log_debug "Validating bytecode for ${contract_name}..."

    local bytecode
    if ! bytecode=$(run_forge_command "inspect" "${sol_file}:${contract_name}" "bytecode" 2>&1); then
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

# Deploy contract with forge create
deploy_contract() {
    local sol_file="$1"
    local contract_name="$2"
    local rpc_url="${3:-http://localhost:8545}"
    local constructor_args="${4:-}"

    log_info "Deploying ${contract_name}..."

    # Check for constructor args file
    local args_file="${sol_file%.*}.args"

    # Build forge arguments
    local forge_args=(
        "${sol_file}:${contract_name}"
        "--broadcast"
        "--unlocked"
        "--from" "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
        "--json"
        "--rpc-url" "${rpc_url}"
        "--optimize"
        "--optimizer-runs" "200"
    )

    # Add constructor args if they exist
    if [[ -f "${args_file}" ]]; then
        forge_args+=("--constructor-args-path" "${args_file}")
        log_debug "Using constructor args from: ${args_file}"
    elif [[ -n "${constructor_args}" ]]; then
        forge_args+=("--constructor-args" "${constructor_args}")
        log_debug "Using provided constructor args"
    fi

    # Deploy the contract
    local deploy_output
    if ! deploy_output=$(run_forge_command "create" "${forge_args[@]}" 2>&1); then
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

# Get deployed bytecode
get_deployed_bytecode() {
    local contract_name="$1"
    local deployed_address="$2"
    local rpc_url="${3:-http://localhost:8545}"

    log_debug "Getting deployed bytecode for ${contract_name}..."

    local bytecode
    if ! bytecode=$(cast code --rpc-url "${rpc_url}" "${deployed_address}" 2>&1); then
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

# =============================================================================
# CONTRACT PROCESSING UTILITIES
# =============================================================================

log_debug "Contract operations library loaded successfully"