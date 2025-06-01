#!/usr/bin/env bash

# abi-output.sh - Robust ABI metadata extraction and processing script
# This script processes Forge build outputs and copies contract metadata to portal directory

# =============================================================================
# LIBRARY IMPORTS
# =============================================================================

# Get script directory and source libraries
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR
source "${SCRIPT_DIR}/lib/all.sh"

# =============================================================================
# SCRIPT INITIALIZATION
# =============================================================================

# Initialize the common library
init_common_lib "abi-output.sh"

# =============================================================================
# SCRIPT-SPECIFIC VARIABLES
# =============================================================================

FORCE_OVERWRITE="${FORCE_OVERWRITE:-false}"
SKIP_CLEAN="${SKIP_CLEAN:-false}"
OUTPUT_DIR="${OUTPUT_DIR:-portal}"

# Counters for reporting
declare -i PROCESSED_COUNT=0
declare -i SKIPPED_COUNT=0
declare -i ERROR_COUNT=0

# =============================================================================
# SCRIPT-SPECIFIC FUNCTIONS
# =============================================================================

# Script-specific cleanup function
script_cleanup() {
    local exit_code="$1"
    if [[ ${exit_code} -eq 0 ]]; then
        log_info "Processing summary: ${PROCESSED_COUNT} processed, ${SKIPPED_COUNT} skipped, ${ERROR_COUNT} errors"
    fi
}

# Create output directory
create_output_directory() {
    local output_path="${PROJECT_ROOT}/${OUTPUT_DIR}"

    if [[ ! -d "${output_path}" ]]; then
        log_info "Creating output directory: ${output_path}"
        if ! mkdir -p "${output_path}"; then
            log_error "Failed to create output directory: ${output_path}"
            return 1
        fi
        log_success "Created output directory: ${output_path}"
    else
        log_info "Output directory already exists: ${output_path}"
    fi
}

# Process individual contract
process_contract() {
    local contract_file="$1"
    local output_dir="${PROJECT_ROOT}/${OUTPUT_DIR}"

    # Use centralized contract processing
    case $(process_contract_metadata "${contract_file}" "${output_dir}" "${FORCE_OVERWRITE}"; echo $?) in
        0)
            PROCESSED_COUNT=$((PROCESSED_COUNT + 1))
            ;;
        1)
            ERROR_COUNT=$((ERROR_COUNT + 1))
            ;;
        2)
            SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
            ;;
    esac
}

# Process all contracts using centralized functionality
process_all_contracts() {
    local output_dir="${PROJECT_ROOT}/${OUTPUT_DIR}"

    # Use centralized contract processing
    if process_all_contract_metadata "${output_dir}" "${FORCE_OVERWRITE}"; then
        log_success "Contract metadata processing completed"
    else
        log_warn "Some errors occurred during contract processing"
        return 1
    fi
}

show_usage() {
    cat << EOF
Usage: ${SCRIPT_NAME} [OPTIONS]

This script builds contracts with Forge and copies contract metadata to the portal directory.

OPTIONS:
    -h, --help       Show this help message
    -v, --verbose    Enable verbose logging (DEBUG level)
    -q, --quiet      Enable quiet mode (ERROR level only)
    -f, --force      Force overwrite existing files
    --skip-clean     Skip cleaning existing files in output directory
    -o, --output DIR Set output directory (default: portal)

ENVIRONMENT VARIABLES:
    LOG_LEVEL        Set logging level (DEBUG, INFO, WARN, ERROR)
    OUTPUT_DIR       Set output directory name
    FORCE_OVERWRITE  Set to 'true' to overwrite existing files
    SKIP_CLEAN       Set to 'true' to skip cleaning output directory

EXAMPLES:
    ${SCRIPT_NAME}                    # Run with default settings
    ${SCRIPT_NAME} --verbose          # Run with verbose output
    ${SCRIPT_NAME} --force            # Force overwrite existing files
    ${SCRIPT_NAME} --skip-clean       # Skip cleaning existing files
    ${SCRIPT_NAME} -o metadata        # Use 'metadata' as output directory
    LOG_LEVEL=DEBUG ${SCRIPT_NAME}    # Run with debug logging

PROCESS:
    1. Validates environment and dependencies
    2. Builds contracts using 'forge build'
    3. Creates output directory if needed
    4. Cleans existing metadata files (unless --skip-clean)
    5. Processes and copies contract metadata files

PREREQUISITES:
    - Forge project with foundry.toml or forge.toml
    - Foundry toolchain (forge command)
    - jq command installed

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
            -f|--force)
                FORCE_OVERWRITE="true"
                log_info "Force overwrite mode enabled"
                ;;
            --skip-clean)
                SKIP_CLEAN="true"
                log_info "Skip cleanup mode enabled"
                ;;
            -o|--output)
                if [[ -n "${2-}" ]]; then
                    OUTPUT_DIR="$2"
                    log_info "Output directory set to: ${OUTPUT_DIR}"
                    shift
                else
                    log_error "Option --output requires a directory name"
                    exit 1
                fi
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

# =============================================================================
# MAIN FUNCTION
# =============================================================================

main() {
    log_info "Starting ${SCRIPT_NAME}..."
    log_info "Script directory: ${SCRIPT_DIR}"
    log_info "Project root: ${PROJECT_ROOT}"
    log_info "Output directory: ${OUTPUT_DIR}"

    # Parse command line arguments
    parse_script_arguments "$@"

    # Validate environment
    validate_forge_environment
    validate_commands "forge" "jq"
    validate_directories "contracts"

    # Build contracts with updated dependencies
    build_contracts

    # Create output directory
    create_output_directory

    # Clean existing metadata files for a fresh start (unless skipped)
    if [[ "${SKIP_CLEAN}" != "true" ]]; then
        clean_output_directory "${PROJECT_ROOT}/${OUTPUT_DIR}"
    else
        log_info "Skipping cleanup of output directory"
    fi

    # Process all contracts
    process_all_contracts

    log_success "ABI metadata processing completed successfully!"
    log_info "Metadata files have been copied to the ${OUTPUT_DIR} directory."
}

# Only run main if script is executed directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi