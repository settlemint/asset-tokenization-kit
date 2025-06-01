#!/usr/bin/env bash

# patch-onchainid.sh - Robust OnChain ID contract patching script
# This script patches OnChain ID contracts for compatibility with current Solidity versions

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
init_common_lib "patch-onchainid.sh"

# =============================================================================
# SCRIPT-SPECIFIC VARIABLES
# =============================================================================

DRY_RUN="${DRY_RUN:-false}"
ONCHAINID_VERSION="${ONCHAINID_VERSION:-v2.2.1}"

# Processing counters
declare -i FILES_PROCESSED=0
declare -i FILES_SKIPPED=0
declare -i PATCHES_APPLIED=0
declare -i PATCHES_SKIPPED=0

# =============================================================================
# SCRIPT-SPECIFIC FUNCTIONS
# =============================================================================

# Script-specific cleanup function
script_cleanup() {
    log_info "Processing summary: ${FILES_PROCESSED} files processed, ${PATCHES_APPLIED} patches applied, ${FILES_SKIPPED} files skipped, ${PATCHES_SKIPPED} patches skipped"
}

find_onchainid_directory() {
    local dependencies_dir="${PROJECT_ROOT}/dependencies"
    local onchainid_dir="${dependencies_dir}/@onchainid-${ONCHAINID_VERSION}"

    log_debug "Looking for OnChain ID directory: ${onchainid_dir}"

    if [[ ! -d "${onchainid_dir}" ]]; then
        # Try to find any @onchainid directory
        local onchainid_dirs=()
        while IFS= read -r -d '' dir; do
            onchainid_dirs+=("$dir")
        done < <(find "${dependencies_dir}" -maxdepth 1 -type d -name '@onchainid-*' -print0 2>/dev/null || true)

        if [[ ${#onchainid_dirs[@]} -eq 0 ]]; then
            log_error "No @onchainid-* directory found in ${dependencies_dir}"
            log_error "Available directories:"
            find "${dependencies_dir}" -maxdepth 1 -type d -printf '%f\n' 2>/dev/null | head -10 >&2 || true
            return 1
        fi

        if [[ ${#onchainid_dirs[@]} -gt 1 ]]; then
            log_warn "Multiple @onchainid directories found:"
            printf '%s\n' "${onchainid_dirs[@]}" >&2
            log_info "Using the first one: ${onchainid_dirs[0]}"
        fi

        onchainid_dir="${onchainid_dirs[0]}"
    fi

    if [[ ! -d "${onchainid_dir}" ]]; then
        log_error "OnChain ID directory not found: ${onchainid_dir}"
        return 1
    fi

    echo "${onchainid_dir}"
}

backup_file() {
    local file="$1"
    local backup_file="${file}.backup"

    if [[ "${DRY_RUN}" == "true" ]]; then
        log_debug "[DRY RUN] Would create backup: ${backup_file}"
        return 0
    fi

    if [[ ! -f "${backup_file}" ]]; then
        if cp "${file}" "${backup_file}"; then
            log_debug "Created backup: ${backup_file}"
        else
            log_error "Failed to create backup: ${backup_file}"
            return 1
        fi
    else
        log_debug "Backup already exists: ${backup_file}"
    fi
}

update_pragma_statements() {
    local onchainid_dir="$1"
    local os_type="$(get_os_type)"

    log_info "Updating pragma statements for all .sol files in ${onchainid_dir}..."

    if [[ ! -d "${onchainid_dir}" ]]; then
        log_error "OnChain ID directory not found: ${onchainid_dir}"
        return 1
    fi

    # Find all .sol files
    local sol_files=()
    while IFS= read -r -d '' file; do
        sol_files+=("$file")
    done < <(find "${onchainid_dir}" -name "*.sol" -type f -print0 2>/dev/null || true)

    if [[ ${#sol_files[@]} -eq 0 ]]; then
        log_warn "No .sol files found in ${onchainid_dir}"
        return 0
    fi

    log_info "Found ${#sol_files[@]} .sol files to process"

    # Process each file
    for sol_file in "${sol_files[@]}"; do
        log_debug "Processing: ${sol_file}"

        # Check if file needs updating
        if ! grep -q "pragma solidity" "${sol_file}"; then
            log_debug "No pragma statement found in ${sol_file}, skipping"
            FILES_SKIPPED=$((FILES_SKIPPED + 1))
            continue
        fi

        # Check if already updated
        if grep -q "pragma solidity >=0.8.0 <0.9.0;" "${sol_file}"; then
            log_debug "File ${sol_file} already has correct pragma, skipping"
            FILES_SKIPPED=$((FILES_SKIPPED + 1))
            continue
        fi

        # Create backup
        if ! backup_file "${sol_file}"; then
            log_error "Failed to backup ${sol_file}, skipping"
            FILES_SKIPPED=$((FILES_SKIPPED + 1))
            continue
        fi

        # Update pragma statement
        if [[ "${DRY_RUN}" == "true" ]]; then
            log_info "[DRY RUN] Would update pragma in: ${sol_file}"
            PATCHES_APPLIED=$((PATCHES_APPLIED + 1))
        else
            if [[ "${os_type}" == "Darwin" ]]; then
                # macOS sed
                if sed -i '' 's/pragma solidity [^;]*;/pragma solidity >=0.8.0 <0.9.0;/g' "${sol_file}"; then
                    log_success "Updated pragma in: ${sol_file}"
                    PATCHES_APPLIED=$((PATCHES_APPLIED + 1))
                else
                    log_error "Failed to update pragma in: ${sol_file}"
                    continue
                fi
            else
                # Linux sed
                if sed -i 's/pragma solidity [^;]*;/pragma solidity >=0.8.0 <0.9.0;/g' "${sol_file}"; then
                    log_success "Updated pragma in: ${sol_file}"
                    PATCHES_APPLIED=$((PATCHES_APPLIED + 1))
                else
                    log_error "Failed to update pragma in: ${sol_file}"
                    continue
                fi
            fi
        fi

        FILES_PROCESSED=$((FILES_PROCESSED + 1))
    done

    log_success "Pragma statement updates completed"
}

update_import_statements() {
    local onchainid_dir="$1"
    local os_type="$(get_os_type)"

    log_info "Updating import statements for all .sol files in ${onchainid_dir}..."

    # Find all .sol files
    local sol_files=()
    while IFS= read -r -d '' file; do
        sol_files+=("$file")
    done < <(find "${onchainid_dir}" -name "*.sol" -type f -print0 2>/dev/null || true)

    if [[ ${#sol_files[@]} -eq 0 ]]; then
        log_warn "No .sol files found in ${onchainid_dir}"
        return 0
    fi

    # Process each file
    for sol_file in "${sol_files[@]}"; do
        log_debug "Processing imports in: ${sol_file}"

        # Check if file has OpenZeppelin imports that need updating
        if ! grep -q "@openzeppelin/contracts" "${sol_file}"; then
            log_debug "No OpenZeppelin imports found in ${sol_file}, skipping"
            continue
        fi

        # Create backup
        if ! backup_file "${sol_file}"; then
            log_error "Failed to backup ${sol_file}, skipping"
            continue
        fi

        # Update import statements
        if [[ "${DRY_RUN}" == "true" ]]; then
            log_info "[DRY RUN] Would update imports in: ${sol_file}"
        else
            local updated=false

            # Update specific import patterns
            if [[ "${os_type}" == "Darwin" ]]; then
                # macOS sed
                if sed -i '' 's|@openzeppelin/contracts/access/Ownable.sol|@openzeppelin/contracts/access/Ownable.sol|g' "${sol_file}" && \
                   sed -i '' 's|@openzeppelin/contracts/utils/Context.sol|@openzeppelin/contracts/utils/Context.sol|g' "${sol_file}"; then
                    updated=true
                fi
            else
                # Linux sed
                if sed -i 's|@openzeppelin/contracts/access/Ownable.sol|@openzeppelin/contracts/access/Ownable.sol|g' "${sol_file}" && \
                   sed -i 's|@openzeppelin/contracts/utils/Context.sol|@openzeppelin/contracts/utils/Context.sol|g' "${sol_file}"; then
                    updated=true
                fi
            fi

            if [[ "${updated}" == "true" ]]; then
                log_success "Updated imports in: ${sol_file}"
                PATCHES_APPLIED=$((PATCHES_APPLIED + 1))
            fi
        fi

        FILES_PROCESSED=$((FILES_PROCESSED + 1))
    done

    log_success "Import statement updates completed"
}

patch_constructor_syntax() {
    local onchainid_dir="$1"
    local os_type="$(get_os_type)"

    log_info "Patching constructor syntax for all .sol files in ${onchainid_dir}..."

    # Find all .sol files
    local sol_files=()
    while IFS= read -r -d '' file; do
        sol_files+=("$file")
    done < <(find "${onchainid_dir}" -name "*.sol" -type f -print0 2>/dev/null || true)

    if [[ ${#sol_files[@]} -eq 0 ]]; then
        log_warn "No .sol files found in ${onchainid_dir}"
        return 0
    fi

    # Process each file
    for sol_file in "${sol_files[@]}"; do
        log_debug "Processing constructor syntax in: ${sol_file}"

        # Check if file has old constructor syntax
        local contract_name
        contract_name=$(basename "${sol_file}" .sol)

        if ! grep -q "function ${contract_name}(" "${sol_file}"; then
            log_debug "No old constructor syntax found in ${sol_file}, skipping"
            continue
        fi

        # Create backup
        if ! backup_file "${sol_file}"; then
            log_error "Failed to backup ${sol_file}, skipping"
            continue
        fi

        # Update constructor syntax
        if [[ "${DRY_RUN}" == "true" ]]; then
            log_info "[DRY RUN] Would update constructor syntax in: ${sol_file}"
            PATCHES_APPLIED=$((PATCHES_APPLIED + 1))
        else
            if [[ "${os_type}" == "Darwin" ]]; then
                # macOS sed
                if sed -i '' "s/function ${contract_name}(/constructor(/g" "${sol_file}"; then
                    log_success "Updated constructor syntax in: ${sol_file}"
                    PATCHES_APPLIED=$((PATCHES_APPLIED + 1))
                else
                    log_error "Failed to update constructor syntax in: ${sol_file}"
                    continue
                fi
            else
                # Linux sed
                if sed -i "s/function ${contract_name}(/constructor(/g" "${sol_file}"; then
                    log_success "Updated constructor syntax in: ${sol_file}"
                    PATCHES_APPLIED=$((PATCHES_APPLIED + 1))
                else
                    log_error "Failed to update constructor syntax in: ${sol_file}"
                    continue
                fi
            fi
        fi

        FILES_PROCESSED=$((FILES_PROCESSED + 1))
    done

    log_success "Constructor syntax updates completed"
}

show_usage() {
    cat << EOF
Usage: ${SCRIPT_NAME} [OPTIONS]

This script patches OnChain ID contracts for compatibility with current Solidity versions.

OPTIONS:
    -h, --help              Show this help message
    -v, --verbose           Enable verbose logging (DEBUG level)
    -q, --quiet             Enable quiet mode (ERROR level only)
    -n, --dry-run           Show what would be done without making changes
    --version VERSION       Specify OnChain ID version (default: ${ONCHAINID_VERSION})

ENVIRONMENT VARIABLES:
    LOG_LEVEL               Set logging level (DEBUG, INFO, WARN, ERROR)
    DRY_RUN                 Set to 'true' for dry run mode
    ONCHAINID_VERSION       Set OnChain ID version to patch

EXAMPLES:
    ${SCRIPT_NAME}                    # Run with default settings
    ${SCRIPT_NAME} --verbose          # Run with verbose output
    ${SCRIPT_NAME} --dry-run          # Show what would be done
    ${SCRIPT_NAME} --version v2.2.0   # Patch specific version

PREREQUISITES:
    - Forge project with foundry.toml or forge.toml
    - OnChain ID dependencies installed in dependencies/ directory
    - sed, grep, find commands available

EOF
}

# =============================================================================
# ARGUMENT PARSING
# =============================================================================

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -v|--verbose)
                LOG_LEVEL="DEBUG"
                ;;
            -q|--quiet)
                LOG_LEVEL="ERROR"
                ;;
            -n|--dry-run)
                DRY_RUN="true"
                ;;
            --version)
                if [[ -n "${2:-}" ]]; then
                    ONCHAINID_VERSION="$2"
                    shift
                else
                    log_error "Option --version requires a value"
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
# MAIN EXECUTION
# =============================================================================

main() {
    # Parse command line arguments
    parse_arguments "$@"

    # Validate environment
    validate_forge_environment
    validate_commands "sed" "grep" "find"

    # Check for dependencies directory
    if [[ ! -d "${PROJECT_ROOT}/dependencies" ]]; then
        log_error "Dependencies directory not found: ${PROJECT_ROOT}/dependencies"
        log_error "Please run dependencies installation first"
        exit 1
    fi

    # Find OnChain ID directory
    local onchainid_dir
    if ! onchainid_dir=$(find_onchainid_directory); then
        log_error "Failed to find OnChain ID directory"
        exit 1
    fi

    log_info "Found OnChain ID directory: ${onchainid_dir}"

    if [[ "${DRY_RUN}" == "true" ]]; then
        log_info "Running in DRY RUN mode - no files will be modified"
    fi

    # Apply patches
    update_pragma_statements "${onchainid_dir}"
    update_import_statements "${onchainid_dir}"
    patch_constructor_syntax "${onchainid_dir}"

    log_success "OnChain ID patching completed successfully"
}

# Run main function with all arguments
main "$@"
