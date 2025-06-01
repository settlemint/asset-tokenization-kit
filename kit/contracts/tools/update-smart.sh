#!/usr/bin/env bash

# update-smart.sh - Smart Protocol dependency update script
# This script updates the smart-protocol dependency to the latest version

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
init_common_lib "update-smart.sh"

# =============================================================================
# SCRIPT-SPECIFIC VARIABLES
# =============================================================================

readonly SOLDEER_API_URL="https://api.soldeer.xyz/api/v1/revision?project_name=smart-protocol&offset=0&limit=1"
readonly SOLDEER_LOCK_FILE="${PROJECT_ROOT}/soldeer.lock"
readonly FOUNDRY_TOML_FILE="${PROJECT_ROOT}/foundry.toml"
readonly REMAPPINGS_FILE="${PROJECT_ROOT}/remappings.txt"
readonly DEPENDENCIES_SCRIPT="${SCRIPT_DIR}/dependencies.sh"

FORCE_UPDATE="${FORCE_UPDATE:-false}"

# =============================================================================
# SCRIPT-SPECIFIC FUNCTIONS
# =============================================================================

# Script-specific cleanup function
script_cleanup() {
    local exit_code="$1"
    if [[ ${exit_code} -eq 0 ]]; then
        log_success "Smart protocol update completed successfully!"
    fi
}

# Show usage information
show_usage() {
    cat << EOF
Usage: ${SCRIPT_NAME} [OPTIONS]

This script updates the smart-protocol dependency to the latest version.

OPTIONS:
    -h, --help      Show this help message
    -v, --verbose   Enable verbose logging (DEBUG level)
    -q, --quiet     Enable quiet mode (ERROR level only)
    -f, --force     Force update without confirmation

ENVIRONMENT VARIABLES:
    LOG_LEVEL       Set logging level (DEBUG, INFO, WARN, ERROR)

EXAMPLES:
    ${SCRIPT_NAME}                    # Run with default settings
    ${SCRIPT_NAME} --verbose          # Run with verbose output
    ${SCRIPT_NAME} --force            # Force update without confirmation
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
                FORCE_UPDATE="true"
                log_info "Force mode enabled - will update without confirmation"
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

# Get the latest version from Soldeer API
get_latest_version() {
    log_info "Fetching latest smart-protocol version from Soldeer API..."

    local response
    if ! response=$(curl -s "${SOLDEER_API_URL}"); then
        log_error "Failed to fetch data from Soldeer API"
        return 1
    fi

    log_debug "API Response: ${response}"

    # Parse JSON response to extract version
    local latest_version
    if command -v jq >/dev/null 2>&1; then
        latest_version=$(echo "${response}" | jq -r '.data[0].version // empty')
    else
        # Fallback parsing without jq
        latest_version=$(echo "${response}" | grep -o '"version":"[^"]*"' | head -1 | cut -d'"' -f4)
    fi

    if [[ -z "${latest_version}" ]]; then
        log_error "Could not parse version from API response"
        return 1
    fi

    echo "${latest_version}"
}

# Get current version from foundry.toml
get_current_version() {
    if [[ ! -f "${FOUNDRY_TOML_FILE}" ]]; then
        log_error "foundry.toml not found at: ${FOUNDRY_TOML_FILE}"
        return 1
    fi

    local current_version
    current_version=$(grep '^smart-protocol = ' "${FOUNDRY_TOML_FILE}" | sed 's/smart-protocol = "\([^"]*\)"/\1/')

    if [[ -z "${current_version}" ]]; then
        log_error "Could not find smart-protocol version in foundry.toml"
        return 1
    fi

    echo "${current_version}"
}

# Remove soldeer.lock file
remove_soldeer_lock() {
    if [[ -f "${SOLDEER_LOCK_FILE}" ]]; then
        log_info "Removing soldeer.lock file..."
        if rm "${SOLDEER_LOCK_FILE}"; then
            log_success "Removed soldeer.lock file"
        else
            log_error "Failed to remove soldeer.lock file"
            return 1
        fi
    else
        log_info "soldeer.lock file not found, skipping removal"
    fi
}

# Update foundry.toml with new version
update_foundry_toml() {
    local new_version="$1"

    if [[ ! -f "${FOUNDRY_TOML_FILE}" ]]; then
        log_error "foundry.toml not found at: ${FOUNDRY_TOML_FILE}"
        return 1
    fi

    log_info "Updating foundry.toml with version ${new_version}..."

    # Create backup
    cp "${FOUNDRY_TOML_FILE}" "${FOUNDRY_TOML_FILE}.backup"

    # Update the version
    if sed -i.tmp "s/^smart-protocol = \".*\"/smart-protocol = \"${new_version}\"/" "${FOUNDRY_TOML_FILE}"; then
        rm -f "${FOUNDRY_TOML_FILE}.tmp"
        log_success "Updated foundry.toml with version ${new_version}"
    else
        log_error "Failed to update foundry.toml"
        # Restore backup
        mv "${FOUNDRY_TOML_FILE}.backup" "${FOUNDRY_TOML_FILE}"
        return 1
    fi

    # Remove backup on success
    rm -f "${FOUNDRY_TOML_FILE}.backup"
}

# Update remappings.txt with new path
update_remappings() {
    local new_version="$1"

    if [[ ! -f "${REMAPPINGS_FILE}" ]]; then
        log_error "remappings.txt not found at: ${REMAPPINGS_FILE}"
        return 1
    fi

    log_info "Updating remappings.txt with new smart-protocol path..."

    # Create backup
    cp "${REMAPPINGS_FILE}" "${REMAPPINGS_FILE}.backup"

    # Update the path
    local new_path="smart-protocol/=dependencies/smart-protocol-${new_version}/"
    if sed -i.tmp "s|^smart-protocol/=dependencies/smart-protocol-.*/$|${new_path}|" "${REMAPPINGS_FILE}"; then
        rm -f "${REMAPPINGS_FILE}.tmp"
        log_success "Updated remappings.txt with path: ${new_path}"
    else
        log_error "Failed to update remappings.txt"
        # Restore backup
        mv "${REMAPPINGS_FILE}.backup" "${REMAPPINGS_FILE}"
        return 1
    fi

    # Remove backup on success
    rm -f "${REMAPPINGS_FILE}.backup"
}

# Run the dependencies script
run_dependencies_script() {
    if [[ ! -f "${DEPENDENCIES_SCRIPT}" ]]; then
        log_error "Dependencies script not found at: ${DEPENDENCIES_SCRIPT}"
        return 1
    fi

    log_info "Running dependencies script..."

    # Pass through verbosity flags
    local deps_args=()
    if [[ "${LOG_LEVEL}" == "DEBUG" ]]; then
        deps_args+=("--verbose")
    elif [[ "${LOG_LEVEL}" == "ERROR" ]]; then
        deps_args+=("--quiet")
    fi

    if [[ "${FORCE_UPDATE}" == "true" ]]; then
        deps_args+=("--force")
    fi

    if "${DEPENDENCIES_SCRIPT}" "${deps_args[@]}"; then
        log_success "Dependencies script completed successfully"
    else
        log_error "Dependencies script failed"
        return 1
    fi
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
    validate_commands "curl"

    # Get current and latest versions
    local current_version latest_version

    if ! current_version=$(get_current_version); then
        log_error "Failed to get current version"
        exit 1
    fi

    if ! latest_version=$(get_latest_version); then
        log_error "Failed to get latest version"
        exit 1
    fi

    log_info "Current smart-protocol version: ${current_version}"
    log_info "Latest smart-protocol version: ${latest_version}"

    # Check if update is needed
    if [[ "${current_version}" == "${latest_version}" ]]; then
        log_info "Smart-protocol is already at the latest version (${current_version})"
        if [[ "${FORCE_UPDATE}" != "true" ]]; then
            log_info "Use --force to update anyway"
            exit 0
        fi
        log_info "Force update enabled, proceeding anyway..."
    fi

    # Confirm update if not in force mode
    if [[ "${FORCE_UPDATE}" != "true" ]]; then
        echo
        read -p "Update smart-protocol from ${current_version} to ${latest_version}? [y/N]: " -r
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Update cancelled by user"
            exit 0
        fi
    fi

    # Perform the update
    log_info "Starting smart-protocol update process..."

    # Remove soldeer.lock
    remove_soldeer_lock

    # Update foundry.toml
    update_foundry_toml "${latest_version}"

    # Update remappings.txt
    update_remappings "${latest_version}"

    # Run dependencies script
    run_dependencies_script

    log_success "Smart-protocol successfully updated to version ${latest_version}!"
}

# Only run main if script is executed directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
