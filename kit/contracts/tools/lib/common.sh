#!/usr/bin/env bash

# common.sh - Shared library for enterprise-grade bash scripts
# This library provides common functionality for all tool scripts

# Prevent multiple sourcing
if [[ "${_COMMON_LIB_LOADED:-}" == "1" ]]; then
    return 0
fi
readonly _COMMON_LIB_LOADED=1

# =============================================================================
# CORE SCRIPT SETUP
# =============================================================================

# Secure script defaults
set -euo pipefail  # Exit on error, undefined vars, pipe failures
IFS=$'\n\t'       # Secure Internal Field Separator

# =============================================================================
# SCRIPT METADATA AND PATHS
# =============================================================================

# Initialize script metadata (to be called by each script)
init_script_metadata() {
    if [[ -z "${SCRIPT_NAME:-}" ]]; then
        readonly SCRIPT_NAME="$(basename "${0}")"
    fi

    if [[ -z "${PROJECT_ROOT:-}" ]]; then
        readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
    fi

    if [[ -z "${LIB_DIR:-}" ]]; then
        readonly LIB_DIR="$(cd "${SCRIPT_DIR}/lib" && pwd)"
    fi
}

# =============================================================================
# COLOR CODES AND STYLING
# =============================================================================

readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly PURPLE='\033[0;35m'
readonly NC='\033[0m' # No Color

# =============================================================================
# LOGGING SYSTEM
# =============================================================================

# Default log level if not set
LOG_LEVEL="${LOG_LEVEL:-INFO}"

# Helper function to apply colors conditionally (disabled in CI)
# Colors are automatically disabled when CI=true environment variable is set
# This is standard practice for CI/CD environments like GitHub Actions
apply_color() {
    local color="$1"
    local text="$2"

    if [[ "${CI:-}" == "true" ]]; then
        echo "${text}"
    else
        echo "${color}${text}${NC}"
    fi
}

# Core logging function
log() {
    local level="$1"
    local level_color="$2"
    shift 2
    local timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
    # All log levels are exactly 4 characters for clean alignment
    local colored_level="$(apply_color "${level_color}" "${level}")"
    local script_context="${SCRIPT_NAME:-common.sh}"
    local colored_message="$(apply_color "${level_color}" "$*")"
    echo -e "${timestamp} [${colored_level}] ${script_context}: ${colored_message}" >&2
}

# Logging level functions with 4-character abbreviations
log_info() {
    [[ "${LOG_LEVEL}" =~ ^(DEBUG|INFO)$ ]] && log "INFO" "${BLUE}" "$*"
}

log_warn() {
    [[ "${LOG_LEVEL}" =~ ^(DEBUG|INFO|WARN)$ ]] && log "WARN" "${YELLOW}" "$*"
}

log_error() {
    log "ERRO" "${RED}" "$*"
}

log_success() {
    log "PASS" "${GREEN}" "$*"
}

log_debug() {
    [[ "${LOG_LEVEL}" == "DEBUG" ]] && log "DEBG" "${CYAN}" "$*"
    return 0
}

# =============================================================================
# ERROR HANDLING AND CLEANUP
# =============================================================================

# Error handler with stack trace
handle_error() {
    local line_number="$1"
    local exit_code="$2"
    log_error "Script failed at line ${line_number} with exit code ${exit_code}"
    log_error "Call stack:"
    local frame=0
    while caller $frame; do
        frame=$((frame + 1))
    done

    # Call script-specific cleanup if defined
    if declare -f cleanup_on_error >/dev/null; then
        cleanup_on_error
    fi

    exit "${exit_code}"
}

# Generic cleanup function
cleanup_on_exit() {
    local exit_code=$?
    if [[ ${exit_code} -ne 0 ]]; then
        log_warn "Script terminated with exit code ${exit_code}"
        log_info "Check the logs above for details"
    fi

    # Call script-specific cleanup if defined
    if declare -f script_cleanup >/dev/null; then
        script_cleanup "${exit_code}"
    fi
}

# Setup error handling (to be called by each script)
setup_error_handling() {
    trap 'handle_error ${LINENO} ${?}' ERR
    trap 'cleanup_on_exit' EXIT INT TERM
}

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# File and directory checks
is_directory() {
    [[ -d "$1" ]]
}

is_file() {
    [[ -f "$1" ]]
}

is_executable() {
    [[ -x "$1" ]]
}

# Network utility
is_port_in_use() {
    local port="$1"
    if command_exists "nc"; then
        nc -z localhost "${port}" 2>/dev/null
    elif command_exists "lsof"; then
        lsof -i:"${port}" >/dev/null 2>&1
    else
        log_warn "Neither 'nc' nor 'lsof' available to check port ${port}"
        return 1
    fi
}

# Get OS type
get_os_type() {
    uname
}

# =============================================================================
# ENVIRONMENT VALIDATION
# =============================================================================

# Validate forge project environment
validate_forge_environment() {
    log_info "Validating Forge environment..."

    # Check if we're in the right directory
    if [[ ! -f "${PROJECT_ROOT}/foundry.toml" ]] && [[ ! -f "${PROJECT_ROOT}/forge.toml" ]]; then
        log_error "Not in a Forge project directory. Expected foundry.toml or forge.toml in ${PROJECT_ROOT}"
        log_error "Directory contents:"
        ls -la "${PROJECT_ROOT}" 2>/dev/null | head -10 >&2 || true
        return 1
    fi

    log_success "Forge environment validation passed"
}

# Validate required commands
validate_commands() {
    local required_commands=("$@")
    local missing_commands=()

    log_info "Validating required commands..."

    for cmd in "${required_commands[@]}"; do
        if ! command_exists "${cmd}"; then
            missing_commands+=("${cmd}")
        fi
    done

    if [[ ${#missing_commands[@]} -gt 0 ]]; then
        log_error "Missing required commands: ${missing_commands[*]}"

        # Provide installation hints
        for cmd in "${missing_commands[@]}"; do
            case "${cmd}" in
                forge|cast|anvil)
                    log_error "Try installing Foundry: curl -L https://foundry.paradigm.xyz | bash"
                    ;;
                jq)
                    log_error "Try installing jq: brew install jq (macOS) or apt-get install jq (Ubuntu)"
                    ;;
                *)
                    log_error "Please install ${cmd} and ensure it's in your PATH"
                    ;;
            esac
        done
        return 1
    fi

    log_success "All required commands are available"
}

# Validate directory structure
validate_directories() {
    local required_dirs=("$@")
    local missing_dirs=()

    for dir in "${required_dirs[@]}"; do
        local full_path="${PROJECT_ROOT}/${dir}"
        if [[ ! -d "${full_path}" ]]; then
            missing_dirs+=("${dir}")
        fi
    done

    if [[ ${#missing_dirs[@]} -gt 0 ]]; then
        log_error "Missing required directories: ${missing_dirs[*]}"
        return 1
    fi

    return 0
}

# =============================================================================
# ARGUMENT PARSING HELPERS
# =============================================================================

# Standard argument parsing for common options
parse_common_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                if declare -f show_usage >/dev/null; then
                    show_usage
                else
                    log_error "Help function 'show_usage' not defined in script"
                fi
                exit 0
                ;;
            -v|--verbose)
                LOG_LEVEL="DEBUG"
                log_info "Verbose mode enabled"
                ;;
            -q|--quiet)
                LOG_LEVEL="ERROR"
                log_info "Quiet mode enabled"
                ;;
            *)
                # Return unprocessed arguments
                echo "$1"
                ;;
        esac
        shift
    done
}

# =============================================================================
# FILE OPERATIONS
# =============================================================================

# Create backup of a file
backup_file() {
    local file="$1"
    local backup_file="${file}.backup"
    local dry_run="${2:-false}"

    if [[ "${dry_run}" == "true" ]]; then
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

# Find files with pattern
find_files() {
    local search_dir="$1"
    local pattern="$2"
    local max_depth="${3:-}"

    local find_args=("${search_dir}")

    if [[ -n "${max_depth}" ]]; then
        find_args+=("-maxdepth" "${max_depth}")
    fi

    find_args+=("-name" "${pattern}" "-type" "f" "-print0")

    find "${find_args[@]}" 2>/dev/null || true
}

# =============================================================================
# FORGE SPECIFIC UTILITIES
# =============================================================================

# Run forge command with error handling
run_forge_command() {
    local command="$1"
    shift
    local args=("$@")

    log_debug "Running forge ${command} ${args[*]}"

    # Change to project root for forge commands
    if ! pushd "${PROJECT_ROOT}" > /dev/null 2>&1; then
        log_error "Failed to change to project directory: ${PROJECT_ROOT}"
        return 1
    fi

    local output
    if output=$(forge "${command}" "${args[@]}" 2>&1); then
        log_debug "Forge ${command} completed successfully"
        popd > /dev/null
        echo "${output}"
        return 0
    else
        log_error "Forge ${command} failed:"
        echo "${output}" >&2
        popd > /dev/null
        return 1
    fi
}

# Build contracts
build_contracts() {
    log_info "Building contracts with Forge..."

    if run_forge_command "build" > /dev/null; then
        log_success "Contracts built successfully"
    else
        log_error "Failed to build contracts"
        return 1
    fi

    # Verify out directory was created
    if [[ ! -d "${PROJECT_ROOT}/out" ]]; then
        log_error "Build output directory not found after build: ${PROJECT_ROOT}/out"
        return 1
    fi
}

# Install dependencies
install_forge_dependencies() {
    log_info "Installing Forge dependencies..."

    # Check if soldeer is available
    if ! run_forge_command "soldeer" "--help" >/dev/null 2>&1; then
        log_error "Forge soldeer command not available. Please update Foundry."
        log_error "Try running: foundryup"
        return 1
    fi

    # Install dependencies with optional timeout
    log_debug "Installing dependencies from ${PROJECT_ROOT}"

    # Change to project root for forge commands
    if ! pushd "${PROJECT_ROOT}" > /dev/null 2>&1; then
        log_error "Failed to change to project directory: ${PROJECT_ROOT}"
        return 1
    fi

    local success=false
    if command_exists "timeout"; then
        # Run forge directly with timeout
        if timeout 300 forge soldeer install > /dev/null 2>&1; then
            success=true
        fi
    else
        # Run without timeout
        if forge soldeer install > /dev/null 2>&1; then
            success=true
        fi
    fi

    popd > /dev/null

    if [[ "${success}" == "true" ]]; then
        log_success "Dependencies installed successfully"
        return 0
    else
        log_error "Failed to install dependencies"
        return 1
    fi
}

# =============================================================================
# JSON OPERATIONS
# =============================================================================

# Validate JSON file
validate_json() {
    local file="$1"

    if [[ ! -f "${file}" ]]; then
        log_warn "JSON file not found: ${file}"
        return 1
    fi

    if ! jq empty "${file}" 2>/dev/null; then
        log_warn "Invalid JSON format in file: ${file}"
        return 1
    fi

    return 0
}

# Extract value from JSON
extract_json_value() {
    local file="$1"
    local path="$2"

    if ! validate_json "${file}"; then
        return 1
    fi

    jq -r "${path}" "${file}" 2>/dev/null || return 1
}

# =============================================================================
# PROCESS MANAGEMENT
# =============================================================================

# Kill process by PID with verification
kill_process() {
    local pid="$1"
    local signal="${2:-TERM}"
    local timeout="${3:-10}"

    if [[ -z "${pid}" ]]; then
        log_debug "No PID provided to kill_process"
        return 0
    fi

    # Check if process exists
    if ! kill -0 "${pid}" 2>/dev/null; then
        log_debug "Process ${pid} is not running"
        return 0
    fi

    log_info "Killing process ${pid} with signal ${signal}"

    # Send signal
    if kill "-${signal}" "${pid}" 2>/dev/null; then
        # Wait for process to exit
        local count=0
        while [[ ${count} -lt ${timeout} ]] && kill -0 "${pid}" 2>/dev/null; do
            sleep 1
            count=$((count + 1))
        done

        # Check if process is still running
        if kill -0 "${pid}" 2>/dev/null; then
            log_warn "Process ${pid} did not exit after ${timeout}s, sending KILL signal"
            kill -KILL "${pid}" 2>/dev/null || true
            sleep 1
        fi

        if ! kill -0 "${pid}" 2>/dev/null; then
            log_success "Process ${pid} terminated successfully"
            return 0
        else
            log_error "Failed to terminate process ${pid}"
            return 1
        fi
    else
        log_error "Failed to send signal ${signal} to process ${pid}"
        return 1
    fi
}

# =============================================================================
# INITIALIZATION FUNCTION
# =============================================================================

# Initialize common library (to be called by each script)
init_common_lib() {
    local script_name="${1:-}"

    # Initialize script metadata
    init_script_metadata

    # Setup error handling
    setup_error_handling

    if [[ -n "${script_name}" ]]; then
        log_debug "Initialized common library for ${script_name}"
    fi
}

# =============================================================================
# LIBRARY LOADED CONFIRMATION
# =============================================================================

# Note: Debug logging is available after init_common_lib() is called