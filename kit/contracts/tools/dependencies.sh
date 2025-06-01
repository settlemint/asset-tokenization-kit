#!/usr/bin/env bash

# dependencies.sh - Robust dependency installation and patching script
# This script installs Forge dependencies and applies necessary patches

# =============================================================================
# LIBRARY IMPORTS
# =============================================================================

# Get script directory and source libraries
declare SCRIPT_DIR
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR
source "${SCRIPT_DIR}/lib/all.sh"

# =============================================================================
# SCRIPT INITIALIZATION
# =============================================================================

# Initialize the common library
init_common_lib "dependencies.sh"

# =============================================================================
# SCRIPT-SPECIFIC VARIABLES
# =============================================================================

FORCE_COPY="${FORCE_COPY:-false}"

# =============================================================================
# SCRIPT-SPECIFIC FUNCTIONS
# =============================================================================

# Script-specific cleanup function
script_cleanup() {
    local exit_code="$1"
    if [[ ${exit_code} -eq 0 ]]; then
        log_success "All operations completed successfully!"
    fi
}

# Show usage information
show_usage() {
    cat << EOF
Usage: ${SCRIPT_NAME} [OPTIONS]

This script installs Forge dependencies and applies necessary patches.

OPTIONS:
    -h, --help      Show this help message
    -v, --verbose   Enable verbose logging (DEBUG level)
    -q, --quiet     Enable quiet mode (ERROR level only)
    -f, --force     Force overwrite existing contracts without confirmation

ENVIRONMENT VARIABLES:
    LOG_LEVEL       Set logging level (DEBUG, INFO, WARN, ERROR)

EXAMPLES:
    ${SCRIPT_NAME}                    # Run with default settings
    ${SCRIPT_NAME} --verbose          # Run with verbose output
    ${SCRIPT_NAME} --force            # Force overwrite existing files
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
            -f|--force)
                FORCE_COPY="true"
                log_info "Force mode enabled - will overwrite existing files"
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

    # Parse command line arguments
    parse_script_arguments "$@"

    # Validate environment
    validate_forge_environment
    validate_commands "forge"

    # Install dependencies
    install_forge_dependencies

    # Clean up .git directories
    remove_git_directories

    # Apply patches
    local patch_script="${SCRIPT_DIR}/patch-onchainid.sh"
    run_patch_script "${patch_script}" "${LOG_LEVEL}"


    log_success "All operations completed successfully!"
}

# Only run main if script is executed directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi