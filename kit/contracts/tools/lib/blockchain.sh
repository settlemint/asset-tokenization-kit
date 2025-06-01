#!/usr/bin/env bash

# blockchain.sh - Blockchain operations utilities for tool scripts
# This library provides blockchain interaction and Anvil management functionality

# Source common library if not already loaded
if [[ "${_COMMON_LIB_LOADED:-}" != "1" ]]; then
    source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
fi

# Prevent multiple sourcing
if [[ "${_BLOCKCHAIN_LIB_LOADED:-}" == "1" ]]; then
    return 0
fi
readonly _BLOCKCHAIN_LIB_LOADED=1

# =============================================================================
# ANVIL MANAGEMENT
# =============================================================================

# Global variable for Anvil PID tracking
ANVIL_PID=""

# Start Anvil with configuration
start_anvil() {
    local port="${1:-8545}"
    local block_time="${2:-1}"
    local force_restart="${3:-false}"
    
    log_info "Checking Anvil status on port ${port}..."

    if is_port_in_use "${port}"; then
        if [[ "${force_restart}" == "true" ]]; then
            log_info "Port ${port} is in use, force restart requested"
            # Try to kill existing process
            if command_exists "lsof"; then
                local existing_pid
                existing_pid=$(lsof -ti:"${port}" 2>/dev/null || true)
                if [[ -n "${existing_pid}" ]]; then
                    log_info "Killing existing process on port ${port} (PID: ${existing_pid})"
                    kill_process "${existing_pid}"
                    sleep 2
                fi
            fi
        else
            log_info "Anvil appears to be already running on port ${port}"
            return 0
        fi
    fi

    log_info "Starting Anvil on port ${port}..."
    anvil --port "${port}" --block-time "${block_time}" > /dev/null 2>&1 &
    ANVIL_PID=$!

    # Wait for anvil to start
    local attempts=0
    local max_attempts=10
    while [[ ${attempts} -lt ${max_attempts} ]]; do
        if is_port_in_use "${port}"; then
            log_success "Anvil started successfully (PID: ${ANVIL_PID})"
            return 0
        fi
        sleep 1
        attempts=$((attempts + 1))
    done

    log_error "Failed to start Anvil after ${max_attempts} attempts"
    ANVIL_PID=""
    return 1
}

# Stop Anvil
stop_anvil() {
    local anvil_pid="${1:-${ANVIL_PID}}"
    
    if [[ -n "${anvil_pid}" ]] && kill -0 "${anvil_pid}" 2>/dev/null; then
        log_info "Stopping Anvil (PID: ${anvil_pid})..."
        if kill_process "${anvil_pid}"; then
            if [[ "${anvil_pid}" == "${ANVIL_PID}" ]]; then
                ANVIL_PID=""
            fi
            return 0
        else
            return 1
        fi
    else
        log_debug "Anvil process not running or PID not provided"
        return 0
    fi
}

# Cleanup Anvil on script exit
cleanup_anvil() {
    stop_anvil ""
}

# Register Anvil cleanup for script
register_anvil_cleanup() {
    # Override the generic cleanup function to include Anvil cleanup
    cleanup_on_error() {
        cleanup_anvil
    }
    
    script_cleanup() {
        local exit_code="$1"
        cleanup_anvil
        if [[ ${exit_code} -eq 0 ]]; then
            log_info "Anvil cleanup completed"
        fi
    }
}

# =============================================================================
# CAST OPERATIONS
# =============================================================================

# Execute cast command with error handling
run_cast_command() {
    local command="$1"
    shift
    local args=("$@")

    log_debug "Running cast ${command} ${args[*]}"

    local output
    if output=$(cast "${command}" "${args[@]}" 2>&1); then
        log_debug "Cast ${command} completed successfully"
        echo "${output}"
        return 0
    else
        log_error "Cast ${command} failed:"
        echo "${output}" >&2
        return 1
    fi
}

# Get contract storage at slot
get_storage_slot() {
    local contract_address="$1"
    local slot="$2"
    local rpc_url="${3:-http://localhost:8545}"
    
    run_cast_command "storage" "--rpc-url" "${rpc_url}" "${contract_address}" "${slot}"
}

# Get contract code
get_contract_code() {
    local contract_address="$1"
    local rpc_url="${2:-http://localhost:8545}"
    
    run_cast_command "code" "--rpc-url" "${rpc_url}" "${contract_address}"
}

# Get block number
get_block_number() {
    local rpc_url="${1:-http://localhost:8545}"
    
    run_cast_command "block-number" "--rpc-url" "${rpc_url}"
}

# =============================================================================
# GENESIS FILE OPERATIONS
# =============================================================================

# Initialize genesis file
initialize_genesis_file() {
    local genesis_file="$1"
    
    log_info "Initializing genesis allocation file..."

    # Remove existing file if it exists
    if [[ -f "${genesis_file}" ]]; then
        rm -f "${genesis_file}"
        log_debug "Removed existing genesis file"
    fi

    # Initialize empty JSON object
    echo "{}" > "${genesis_file}"
    log_success "Genesis allocation file initialized"
}

# Add contract allocation to genesis file
add_to_genesis() {
    local genesis_file="$1"
    local contract_name="$2"
    local target_address="$3"
    local bytecode="$4"
    local storage_json="$5"

    log_debug "Adding ${contract_name} to genesis allocation..."

    # Use jq to add the contract allocation to the genesis file
    local temp_file="$(dirname "${genesis_file}")/temp.json"
    if ! jq --arg address "${target_address}" \
       --arg bytecode "${bytecode}" \
       --argjson storage "${storage_json}" \
       '. + {($address): {
         balance: "0x0",
         code: ("0x" + $bytecode),
         storage: $storage
       }}' "${genesis_file}" > "${temp_file}"; then
        log_error "jq command failed for ${contract_name}"
        rm -f "${temp_file}"
        return 1
    fi

    mv "${temp_file}" "${genesis_file}"
    log_success "Added ${contract_name} to genesis allocation"
}

# Copy genesis file to secondary location
copy_genesis_file() {
    local source_file="$1"
    local dest_dir="$2"
    local dest_file="${dest_dir}/genesis-output.json"
    
    log_info "Copying genesis allocation to second location..."

    # Create the second output directory if it doesn't exist
    if ! mkdir -p "${dest_dir}"; then
        log_error "Failed to create second output directory: ${dest_dir}"
        return 1
    fi

    # Copy the file
    if cp "${source_file}" "${dest_file}"; then
        log_success "Successfully copied genesis allocation to: ${dest_file}"
    else
        log_error "Failed to copy genesis allocation to second location"
        return 1
    fi
}

# =============================================================================
# NETWORK UTILITIES
# =============================================================================


# Check network connectivity
check_network_connectivity() {
    local rpc_url="${1:-http://localhost:8545}"
    
    log_debug "Checking network connectivity to ${rpc_url}..."
    
    if get_block_number "${rpc_url}" >/dev/null 2>&1; then
        log_debug "Network connectivity confirmed"
        return 0
    else
        log_warn "Network connectivity failed"
        return 1
    fi
}

log_debug "Blockchain operations library loaded successfully" 