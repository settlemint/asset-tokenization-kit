#!/usr/bin/env bash

# patch-abi-path.sh - Patch ABI paths in subgraph.yaml
# This script updates ABI paths from ../artifacts to ../contracts/artifacts

# =============================================================================
# LIBRARY IMPORTS
# =============================================================================

# Get script directory and source libraries
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/all.sh"

# =============================================================================
# SCRIPT INITIALIZATION
# =============================================================================

# Initialize the common library
init_common_lib "patch-abi-path.sh"

# =============================================================================
# SCRIPT-SPECIFIC VARIABLES
# =============================================================================

# Path to subgraph.yaml relative to contracts directory
readonly SUBGRAPH_YAML_PATH="${PROJECT_ROOT}/../subgraph/subgraph.yaml"

# =============================================================================
# SCRIPT-SPECIFIC FUNCTIONS
# =============================================================================

# Script-specific cleanup function
script_cleanup() {
    local exit_code="$1"
    if [[ ${exit_code} -eq 0 ]]; then
        log_success "ABI path patching completed successfully!"
    fi
}

# Show usage information
show_usage() {
    cat << EOF
Usage: ${SCRIPT_NAME} [OPTIONS]

This script patches ABI paths in subgraph.yaml from ../artifacts to ../contracts/artifacts.

OPTIONS:
    -h, --help      Show this help message
    -v, --verbose   Enable verbose logging (DEBUG level)
    -q, --quiet     Enable quiet mode (ERROR level only)

ENVIRONMENT VARIABLES:
    LOG_LEVEL       Set logging level (DEBUG, INFO, WARN, ERROR)

EXAMPLES:
    ${SCRIPT_NAME}                    # Run with default settings
    ${SCRIPT_NAME} --verbose          # Run with verbose output
    LOG_LEVEL=DEBUG ${SCRIPT_NAME}    # Run with debug logging

EOF
}

# Parse script-specific arguments
parse_script_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -v|--verbose)
                LOG_LEVEL="DEBUG"
                log_info "Verbose mode enabled"
                ;;
            -q|--quiet)
                LOG_LEVEL="ERROR"
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
        shift
    done
}

# Patch ABI paths in subgraph.yaml
patch_abi_paths() {
    log_info "Patching ABI paths in subgraph.yaml..."

    # Check if subgraph.yaml exists
    if [[ ! -f "${SUBGRAPH_YAML_PATH}" ]]; then
        log_error "Subgraph.yaml not found at: ${SUBGRAPH_YAML_PATH}"
        return 1
    fi

    # Create backup
    local backup_file="${SUBGRAPH_YAML_PATH}.bak"
    log_debug "Creating backup at: ${backup_file}"
    cp "${SUBGRAPH_YAML_PATH}" "${backup_file}" || {
        log_error "Failed to create backup of subgraph.yaml"
        return 1
    }

    # Count lines to be changed (for logging)
    local lines_to_change
    lines_to_change=$(grep -c "file: \.\./artifacts" "${SUBGRAPH_YAML_PATH}" 2>/dev/null || true)
    if [[ -z "${lines_to_change}" ]]; then
        lines_to_change=0
    fi
    log_info "Found ${lines_to_change} ABI path(s) to update"

    if [[ ${lines_to_change} -eq 0 ]]; then
        log_warn "No ABI paths found to patch"
        rm -f "${backup_file}"
        return 0
    fi

    # Perform the replacement
    log_debug "Replacing '../artifacts' with '../contracts/artifacts' in ${SUBGRAPH_YAML_PATH}"
    sed -i.tmp 's|file: \.\./artifacts|file: ../contracts/artifacts|g' "${SUBGRAPH_YAML_PATH}" || {
        log_error "Failed to patch ABI paths"
        # Restore backup
        mv "${backup_file}" "${SUBGRAPH_YAML_PATH}"
        return 1
    }

    # Remove sed temporary file
    rm -f "${SUBGRAPH_YAML_PATH}.tmp"

    # Verify changes
    local lines_after_change
    lines_after_change=$(grep -c "file: \.\./contracts/artifacts" "${SUBGRAPH_YAML_PATH}" 2>/dev/null || true)
    if [[ -z "${lines_after_change}" ]]; then
        lines_after_change=0
    fi

    if [[ ${lines_after_change} -eq ${lines_to_change} ]]; then
        log_success "Successfully patched ${lines_after_change} ABI path(s)"
        rm -f "${backup_file}"
    else
        log_error "Patch verification failed. Expected ${lines_to_change}, found ${lines_after_change}"
        # Restore backup
        mv "${backup_file}" "${SUBGRAPH_YAML_PATH}"
        return 1
    fi

    return 0
}

# =============================================================================
# MAIN FUNCTION
# =============================================================================

main() {
    log_info "Starting ${SCRIPT_NAME}..."
    log_info "Script directory: ${SCRIPT_DIR}"
    log_info "Project root: ${PROJECT_ROOT}"
    log_info "Subgraph.yaml path: ${SUBGRAPH_YAML_PATH}"

    # Parse command line arguments
    parse_script_arguments "$@"

    # Validate environment
    validate_commands "sed" "grep"

    # Patch ABI paths
    patch_abi_paths || {
        log_error "Failed to patch ABI paths"
        exit 1
    }

    log_success "ABI path patching completed successfully!"
}

# Only run main if script is executed directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
