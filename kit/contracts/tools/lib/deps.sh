#!/usr/bin/env bash

# deps.sh - Dependency management utilities for tool scripts
# This library provides dependency-specific functionality

# Source common library if not already loaded
if [[ "${_COMMON_LIB_LOADED:-}" != "1" ]]; then
    source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
fi

# Prevent multiple sourcing
if [[ "${_DEPS_LIB_LOADED:-}" == "1" ]]; then
    return 0
fi
readonly _DEPS_LIB_LOADED=1

# =============================================================================
# DEPENDENCY MANAGEMENT
# =============================================================================

# Remove .git directories from dependencies
remove_git_directories() {
    log_info "Removing .git directories from dependencies..."

    local dependencies_dir="${PROJECT_ROOT}/dependencies"

    if [[ ! -d "${dependencies_dir}" ]]; then
        log_warn "Dependencies directory does not exist: ${dependencies_dir}"
        return 0
    fi

    local git_dirs
    mapfile -t git_dirs < <(find "${dependencies_dir}" -name ".git" -type d 2>/dev/null || true)

    if [[ ${#git_dirs[@]} -eq 0 ]]; then
        log_info "No .git directories found in dependencies"
        return 0
    fi

    log_info "Found ${#git_dirs[@]} .git directories to remove"

    for git_dir in "${git_dirs[@]}"; do
        if rm -rf "${git_dir}"; then
            :  # Success - do nothing
        else
            log_warn "Failed to remove: ${git_dir}"
        fi
    done

    log_success "Cleaned up .git directories"
}

# Find smart-protocol directory
find_smart_protocol_dir() {
    local dependencies_dir="${PROJECT_ROOT}/dependencies"
    local smart_protocol_dirs

    if [[ ! -d "${dependencies_dir}" ]]; then
        log_error "Dependencies directory does not exist: ${dependencies_dir}"
        return 1
    fi

    mapfile -t smart_protocol_dirs < <(find "${dependencies_dir}" -maxdepth 1 -type d -name 'smart-protocol-*' 2>/dev/null || true)

    if [[ ${#smart_protocol_dirs[@]} -eq 0 ]]; then
        log_error "No smart-protocol-* directory found in ${dependencies_dir}"
        return 1
    fi

    if [[ ${#smart_protocol_dirs[@]} -gt 1 ]]; then
        log_warn "Multiple smart-protocol directories found:"
        printf '%s\n' "${smart_protocol_dirs[@]}" >&2
        log_info "Using the first one: ${smart_protocol_dirs[0]}"
    fi

    echo "${smart_protocol_dirs[0]}"
}

# Get smart-protocol version from foundry.toml
get_smart_protocol_version() {
    local foundry_toml="${PROJECT_ROOT}/foundry.toml"

    if [[ ! -f "${foundry_toml}" ]]; then
        log_error "foundry.toml not found at: ${foundry_toml}"
        return 1
    fi

    # Extract smart-protocol version from foundry.toml
    local version
    version=$(sed -n 's/^smart-protocol.*"\([^"]*\)".*/\1/p' "${foundry_toml}")

    if [[ -z "${version}" ]]; then
        log_error "Could not find smart-protocol version in foundry.toml"
        return 1
    fi

    echo "${version}"
}

# Find OnChain ID directory
find_onchainid_directory() {
    local dependencies_dir="${PROJECT_ROOT}/dependencies"
    local version="${1:-v2.2.1}"
    local onchainid_dir="${dependencies_dir}/@onchainid-${version}"

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
            ls -la "${dependencies_dir}" 2>/dev/null | head -10 >&2 || true
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

# Copy directory with diff and confirmation
copy_directory_with_confirmation() {
    local source_dir="$1"
    local dest_dir="$2"
    local dir_name="$3"
    local force_copy="${4:-false}"

    # Check if we need to prompt for confirmation
    if [[ "${force_copy}" != "true" ]]; then
        # Check for existing files that would be overwritten
        local conflicting_files=()
        while IFS= read -r -d '' file; do
            local relative_path="${file#${source_dir}/}"
            local dest_file="${dest_dir}/${relative_path}"
            if [[ -f "${dest_file}" ]]; then
                conflicting_files+=("${relative_path}")
            fi
        done < <(find "${source_dir}" -type f -print0)

        if [[ ${#conflicting_files[@]} -gt 0 ]]; then
            log_warn "The following ${dir_name} files already exist and will be overwritten:"
            for file in "${conflicting_files[@]}"; do
                echo "  ${file}" >&2
            done

            # Check for actual differences and show diff for files with changes
            local files_with_differences=()
            for file in "${conflicting_files[@]}"; do
                local source_file="${source_dir}/${file}"
                local dest_file="${dest_dir}/${file}"

                if command_exists "diff"; then
                    if ! diff -q "${dest_file}" "${source_file}" >/dev/null 2>&1; then
                        files_with_differences+=("${file}")
                        echo "=== Diff for ${dir_name}/${file} ===" >&2
                        diff -u "${dest_file}" "${source_file}" 2>/dev/null || true
                        echo "" >&2
                    fi
                else
                    log_warn "diff command not available, cannot check for differences"
                    files_with_differences+=("${file}")
                fi
            done

            # Only ask for confirmation if there are actual differences
            if [[ ${#files_with_differences[@]} -gt 0 ]]; then
                if command_exists "diff"; then
                    log_info "Found ${#files_with_differences[@]} ${dir_name} file(s) with differences"
                fi
                echo -n "Do you want to continue and overwrite these ${dir_name} files? [y/N]: " >&2
                read -r response
                case "${response}" in
                    [yY]|[yY][eE][sS])
                        log_info "User confirmed overwrite for ${dir_name}"
                        ;;
                    *)
                        log_info "Operation cancelled by user for ${dir_name}"
                        return 0
                        ;;
                esac
            else
                log_info "All existing ${dir_name} files are identical to source files, proceeding without confirmation"
            fi
        fi
    fi

    # Perform the copy
    log_info "Copying ${dir_name} from ${source_dir} to ${dest_dir}"
    if cp -r "${source_dir}"/* "${dest_dir}"/; then
        log_success "${dir_name} copied successfully"
    else
        log_error "Failed to copy ${dir_name}"
        return 1
    fi
}

# Copy smart-protocol files
copy_smart_protocol_files() {
    local force_copy="${1:-false}"

    log_info "Copying smart-protocol files..."

    # Get the smart-protocol version from foundry.toml
    local version
    if ! version="$(get_smart_protocol_version)"; then
        log_error "Failed to get smart-protocol version"
        return 1
    fi

    log_info "Using smart-protocol version: ${version}"

    # Define directories to copy: source_subdir:dest_subdir
    local directories=(
        "contracts:contracts"
        "ignition/modules:ignition/modules"
        "scripts:scripts"
        "test:test"
    )

    local dependencies_dir="${PROJECT_ROOT}/dependencies"
    local smart_protocol_dir="${dependencies_dir}/smart-protocol-${version}"

    # Process each directory
    for dir_mapping in "${directories[@]}"; do
        local source_subdir="${dir_mapping%:*}"
        local dest_subdir="${dir_mapping#*:}"
        local source_dir="${smart_protocol_dir}/${source_subdir}"
        local dest_dir="${PROJECT_ROOT}/${dest_subdir}"

        log_info "Processing ${source_subdir} -> ${dest_subdir}"

        # Check if source directory exists
        if [[ ! -d "${source_dir}" ]]; then
            log_warn "Source directory not found, skipping: ${source_dir}"
            continue
        fi

        # Create destination directory if it doesn't exist
        if [[ ! -d "${dest_dir}" ]]; then
            log_info "Creating directory: ${dest_dir}"
            if ! mkdir -p "${dest_dir}"; then
                log_error "Failed to create directory: ${dest_dir}"
                return 1
            fi
        fi

        # Copy the directory with diff and confirmation logic
        if ! copy_directory_with_confirmation "${source_dir}" "${dest_dir}" "${source_subdir}" "${force_copy}"; then
            log_error "Failed to copy ${source_subdir}"
            return 1
        fi
    done

    log_success "All smart-protocol files copied successfully"
}

# Run patch script with proper argument handling
run_patch_script() {
    local patch_script="$1"
    local log_level="${2:-${LOG_LEVEL}}"

    log_info "Patching onchainid..."

    if [[ ! -f "${patch_script}" ]]; then
        log_error "Local patch script not found: ${patch_script}"
        return 1
    fi

    log_info "Found local patch script: ${patch_script}"

    # Make executable if not already
    if [[ ! -x "${patch_script}" ]]; then
        log_info "Making patch script executable..."
        if ! chmod +x "${patch_script}"; then
            log_error "Failed to make patch script executable"
            return 1
        fi
    fi

    # Execute patch script with appropriate verbosity
    log_info "Executing local patch script..."
    local patch_args=()

    # Pass through logging level
    case "${log_level}" in
        "DEBUG")
            patch_args+=("--verbose")
            ;;
        "ERROR")
            patch_args+=("--quiet")
            ;;
    esac

    # Execute with proper array handling
    if [[ ${#patch_args[@]} -gt 0 ]]; then
        if "${patch_script}" "${patch_args[@]}"; then
            log_success "Patch applied successfully"
        else
            log_error "Patch script failed"
            return 1
        fi
    else
        if "${patch_script}"; then
            log_success "Patch applied successfully"
        else
            log_error "Patch script failed"
            return 1
        fi
    fi
}

log_debug "Dependency management library loaded successfully"