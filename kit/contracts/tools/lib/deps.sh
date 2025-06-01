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

# Check if file differences are only ABI path related
files_differ_only_in_abi_paths() {
    local dest_file="$1"
    local source_file="$2"
    local relative_path="$3"

    # Only check for ABI path differences in subgraph.yaml
    if [[ "${relative_path}" != "subgraph.yaml" ]]; then
        return 1  # Not subgraph.yaml, so check normally
    fi

    # Create temporary files with normalized ABI paths
    local temp_dest temp_source
    temp_dest=$(mktemp)
    temp_source=$(mktemp)

    # Normalize ABI paths in both files to make them comparable
    # Convert both ../artifacts and ../contracts/artifacts to a common pattern
    sed 's|file: \.\./contracts/artifacts|file: ../artifacts|g' "${dest_file}" > "${temp_dest}"
    sed 's|file: \.\./contracts/artifacts|file: ../artifacts|g' "${source_file}" > "${temp_source}"

    # Check if files are identical after normalization
    local result=0
    if ! diff -q "${temp_dest}" "${temp_source}" >/dev/null 2>&1; then
        result=1  # Still different after normalization
    fi

    # Clean up temporary files
    rm -f "${temp_dest}" "${temp_source}"

    return ${result}
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
                        # Check if differences are only ABI path related
                        if files_differ_only_in_abi_paths "${dest_file}" "${source_file}" "${file}"; then
                            log_debug "Ignoring ABI path differences in ${file}"
                        else
                            files_with_differences+=("${file}")
                            echo "=== Diff for ${dir_name}/${file} ===" >&2
                            diff -u "${dest_file}" "${source_file}" 2>/dev/null || true
                            echo "" >&2
                        fi
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