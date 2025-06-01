#!/usr/bin/env bash
# common.sh - Common utilities for subgraph tools
#
# This library provides:
# - Colored output and logging functions
# - Error handling and debugging utilities
# - Command validation and environment checks
# - File and directory operations
#
# Usage:
#   source "${SCRIPT_DIR}/lib/common.sh"
#   init_common_lib "my-script.sh"

# Prevent multiple sourcing
if [[ "${_COMMON_LIB_LOADED:-}" == "true" ]]; then
    return 0
fi
readonly _COMMON_LIB_LOADED="true"

# ============================================================================
# CONSTANTS
# ============================================================================

# Color codes for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly PURPLE='\033[0;35m'
readonly NC='\033[0m' # No Color

# Script metadata (set by init_script_metadata)
SCRIPT_NAME=""
SCRIPT_DIR=""
PROJECT_ROOT=""
SUBGRAPH_DIR=""

# Logging configuration
LOG_LEVEL="${LOG_LEVEL:-info}"
DEBUG_MODE="${DEBUG:-false}"
QUIET_MODE="${QUIET:-false}"
VERBOSE_MODE="${VERBOSE:-false}"

# Export LOG_LEVEL if set
export LOG_LEVEL

# Backup files array
BACKUP_FILES=()

# Exit codes
readonly EXIT_SUCCESS=0
readonly EXIT_ERROR=1
readonly EXIT_INVALID_ARGS=2
readonly EXIT_MISSING_DEPS=3
readonly EXIT_CONFIG_ERROR=4

# Export exit codes for use in other scripts
export EXIT_SUCCESS EXIT_ERROR EXIT_INVALID_ARGS EXIT_MISSING_DEPS EXIT_CONFIG_ERROR

# ============================================================================
# INITIALIZATION
# ============================================================================

# Initialize script metadata
init_script_metadata() {
    SCRIPT_NAME="${1:-}"
    if [[ -z "${SCRIPT_DIR:-}" ]]; then
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[1]}")" && pwd)"
    fi

    # Navigate up from subgraph/tools to find project root
    local current_dir="$SCRIPT_DIR"
    while [[ "$current_dir" != "/" ]]; do
        # Look for the kit directory that contains both contracts and subgraph
        if [[ -d "$current_dir/contracts" ]] && [[ -d "$current_dir/subgraph" ]]; then
            PROJECT_ROOT="$current_dir"
            break
        fi
        current_dir="$(dirname "$current_dir")"
    done

    if [[ -z "$PROJECT_ROOT" ]]; then
        echo "Error: Could not find project root directory" >&2
        exit "$EXIT_CONFIG_ERROR"
    fi

    SUBGRAPH_DIR="${PROJECT_ROOT}/subgraph"
    
    # Export for use in other scripts
    export SCRIPT_NAME SCRIPT_DIR PROJECT_ROOT SUBGRAPH_DIR
}

# Main initialization function
init_common_lib() {
    local script_name="${1:-$(basename "${BASH_SOURCE[1]}")}"

    # Set secure defaults
    set -euo pipefail
    IFS=$'\n\t'

    # Initialize metadata
    init_script_metadata "$script_name"

    # Set up error handling
    trap 'handle_error ${LINENO} ${?}' ERR
    trap 'cleanup_on_exit' EXIT INT TERM

    # Parse common arguments
    parse_common_arguments "$@"
}

# ============================================================================
# LOGGING FUNCTIONS
# ============================================================================

# Get current timestamp
get_timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

# Log info message
log_info() {
    if [[ "$QUIET_MODE" != "true" ]]; then
        echo -e "${BLUE}[$(get_timestamp)] INFO:${NC} $*"
    fi
}

# Log warning message
log_warn() {
    echo -e "${YELLOW}[$(get_timestamp)] WARN:${NC} $*" >&2
}

# Log error message
log_error() {
    echo -e "${RED}[$(get_timestamp)] ERROR:${NC} $*" >&2
}

# Log success message
log_success() {
    if [[ "$QUIET_MODE" != "true" ]]; then
        echo -e "${GREEN}[$(get_timestamp)] SUCCESS:${NC} $*"
    fi
}

# Log debug message (only in debug mode)
log_debug() {
    if [[ "$DEBUG_MODE" == "true" ]] || [[ "$VERBOSE_MODE" == "true" ]]; then
        echo -e "${CYAN}[$(get_timestamp)] DEBUG:${NC} $*" >&2
    fi
}

# Print a header
print_header() {
    if [[ "$QUIET_MODE" != "true" ]]; then
        echo
        echo -e "${PURPLE}===================================================${NC}"
        echo -e "${PURPLE}$*${NC}"
        echo -e "${PURPLE}===================================================${NC}"
        echo
    fi
}

# Print a separator
print_separator() {
    if [[ "$QUIET_MODE" != "true" ]]; then
        echo -e "${PURPLE}---------------------------------------------------${NC}"
    fi
}

# ============================================================================
# ERROR HANDLING
# ============================================================================

# Handle errors with stack trace
handle_error() {
    local line_number="$1"
    local exit_code="$2"

    log_error "Command failed with exit code $exit_code at line $line_number"

    if [[ "$DEBUG_MODE" == "true" ]] || [[ "$VERBOSE_MODE" == "true" ]]; then
        log_error "Call stack:"
        local frame=0
        while caller $frame; do
            ((frame++))
        done | while read -r line func file; do
            log_error "  at $func ($file:$line)"
        done
    fi

    exit "$exit_code"
}

# Cleanup function called on exit
cleanup_on_exit() {
    local exit_code=$?

    # Add any cleanup tasks here
    log_debug "Cleaning up..."

    # Restore any modified files
    if [[ ${#BACKUP_FILES[@]} -gt 0 ]]; then
        for file in "${BACKUP_FILES[@]}"; do
            if [[ -f "${file}.backup" ]]; then
                log_debug "Restoring $file from backup"
                mv -f "${file}.backup" "$file" 2>/dev/null || true
            fi
        done
    fi

    if [[ $exit_code -eq 0 ]]; then
        log_debug "Script completed successfully"
    else
        log_debug "Script exited with code $exit_code"
    fi
}

# ============================================================================
# VALIDATION FUNCTIONS
# ============================================================================

# Check if a command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Validate required commands
validate_commands() {
    local commands=("$@")
    local missing_commands=()

    for cmd in "${commands[@]}"; do
        if ! command_exists "$cmd"; then
            missing_commands+=("$cmd")
        fi
    done

    if [[ ${#missing_commands[@]} -gt 0 ]]; then
        log_error "Missing required commands: ${missing_commands[*]}"
        log_error "Please install the missing dependencies."

        # Provide installation hints
        for cmd in "${missing_commands[@]}"; do
            case "$cmd" in
                jq)
                    log_info "  Install jq: https://jqlang.github.io/jq/download/"
                    ;;
                yq)
                    log_info "  Install yq: https://github.com/mikefarah/yq#install"
                    ;;
                graph)
                    log_info "  Install graph-cli: npm install -g @graphprotocol/graph-cli"
                    ;;
                *)
                    log_info "  Install $cmd using your package manager"
                    ;;
            esac
        done

        return "$EXIT_MISSING_DEPS"
    fi

    return "$EXIT_SUCCESS"
}

# Validate file exists and is readable
validate_file() {
    local file="$1"
    local description="${2:-File}"

    if [[ ! -f "$file" ]]; then
        log_error "$description not found: $file"
        return "$EXIT_ERROR"
    fi

    if [[ ! -r "$file" ]]; then
        log_error "$description is not readable: $file"
        return "$EXIT_ERROR"
    fi

    return "$EXIT_SUCCESS"
}

# Validate directory exists and is accessible
validate_directory() {
    local dir="$1"
    local description="${2:-Directory}"

    if [[ ! -d "$dir" ]]; then
        log_error "$description not found: $dir"
        return "$EXIT_ERROR"
    fi

    if [[ ! -r "$dir" ]] || [[ ! -x "$dir" ]]; then
        log_error "$description is not accessible: $dir"
        return "$EXIT_ERROR"
    fi

    return "$EXIT_SUCCESS"
}

# Validate JSON file
validate_json() {
    local file="$1"

    if ! jq empty "$file" 2>/dev/null; then
        log_error "Invalid JSON in file: $file"
        return "$EXIT_ERROR"
    fi

    return "$EXIT_SUCCESS"
}

# ============================================================================
# FILE OPERATIONS
# ============================================================================

# Backup a file
backup_file() {
    local file="$1"
    local backup_suffix="${2:-.backup}"

    if [[ -f "$file" ]]; then
        cp "$file" "${file}${backup_suffix}"
        log_debug "Backed up $file to ${file}${backup_suffix}"

        # Track backup for cleanup
        BACKUP_FILES+=("$file")
    fi
}

# Create directory if it doesn't exist
ensure_directory() {
    local dir="$1"

    if [[ ! -d "$dir" ]]; then
        log_debug "Creating directory: $dir"
        mkdir -p "$dir"
    fi
}

# ============================================================================
# ARGUMENT PARSING
# ============================================================================

# Parse common arguments
parse_common_arguments() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -h|--help)
                show_usage
                exit "$EXIT_SUCCESS"
                ;;
            -v|--verbose)
                VERBOSE_MODE="true"
                ;;
            -q|--quiet)
                QUIET_MODE="true"
                ;;
            -d|--debug)
                DEBUG_MODE="true"
                VERBOSE_MODE="true"
                LOG_LEVEL="debug"
                export LOG_LEVEL
                ;;
            *)
                # Let the main script handle other arguments
                break
                ;;
        esac
        shift
    done
}

# Show usage (to be overridden by main script)
show_usage() {
    cat << EOF
Usage: $SCRIPT_NAME [OPTIONS]

Common Options:
  -h, --help      Show this help message
  -v, --verbose   Enable verbose output
  -q, --quiet     Suppress informational output
  -d, --debug     Enable debug mode (implies verbose)

EOF
}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

# Ask for user confirmation
confirm() {
    local prompt="${1:-Continue?}"
    local default="${2:-n}"

    if [[ "$QUIET_MODE" == "true" ]]; then
        [[ "$default" == "y" ]] && return 0 || return 1
    fi

    local response
    read -r -p "$prompt [y/N]: " response

    case "$response" in
        [yY][eE][sS]|[yY])
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Get relative path from project root
get_relative_path() {
    local path="$1"
    local base="${2:-$PROJECT_ROOT}"

    # Use realpath if available, otherwise fall back to a simple method
    if command_exists realpath; then
        realpath --relative-to="$base" "$path" 2>/dev/null || echo "$path"
    else
        echo "$path"
    fi
}

# ============================================================================
# FORGE/FOUNDRY FUNCTIONS
# ============================================================================

# Validate Forge/Foundry environment
validate_forge_environment() {
    log_debug "Validating Forge environment..."
    
    # Check for foundry config files in the parent kit directory
    local kit_dir="${PROJECT_ROOT}"
    local contracts_dir="${kit_dir}/contracts"
    
    if [[ ! -f "${contracts_dir}/foundry.toml" ]] && [[ ! -f "${contracts_dir}/forge.toml" ]]; then
        log_error "No Foundry config file found (foundry.toml or forge.toml)"
        log_error "Make sure you're in a Forge project with a foundry.toml file"
        return "$EXIT_CONFIG_ERROR"
    fi
    
    # Check if forge command is available
    if ! command_exists "forge"; then
        log_error "Forge command not found"
        log_error "Please install Foundry: https://book.getfoundry.sh/getting-started/installation"
        return "$EXIT_MISSING_DEPS"
    fi
    
    log_debug "Forge environment validated successfully"
    return "$EXIT_SUCCESS"
}

# Run forge command with error handling
run_forge_command() {
    local subcommand="$1"
    shift
    local args=("$@")
    
    log_debug "Running: forge ${subcommand} ${args[*]}"
    
    # Change to contracts directory for forge commands
    local contracts_dir="${PROJECT_ROOT}/contracts"
    
    if cd "${contracts_dir}"; then
        if forge "${subcommand}" "${args[@]}"; then
            cd - > /dev/null || true
            return "$EXIT_SUCCESS"
        else
            cd - > /dev/null || true
            log_error "Forge command failed: forge ${subcommand} ${args[*]}"
            return "$EXIT_ERROR"
        fi
    else
        log_error "Could not change to contracts directory: ${contracts_dir}"
        return "$EXIT_ERROR"
    fi
}

# Validate required directories exist
validate_directories() {
    local dirs=("$@")
    local missing_dirs=()
    
    for dir in "${dirs[@]}"; do
        local full_path="${PROJECT_ROOT}/${dir}"
        if [[ ! -d "${full_path}" ]]; then
            missing_dirs+=("${dir}")
        fi
    done
    
    if [[ ${#missing_dirs[@]} -gt 0 ]]; then
        log_error "Missing required directories: ${missing_dirs[*]}"
        return "$EXIT_ERROR"
    fi
    
    return "$EXIT_SUCCESS"
}

# ============================================================================
# FORGE/CONTRACT COMPATIBILITY FUNCTIONS
# ============================================================================

# Validate forge project environment
validate_forge_environment() {
    log_info "Validating Forge environment..."

    # Check if we're in the right directory structure
    local contracts_dir="${PROJECT_ROOT}/contracts"
    if [[ ! -f "${contracts_dir}/foundry.toml" ]] && [[ ! -f "${contracts_dir}/forge.toml" ]]; then
        log_error "Not in a valid project structure. Expected foundry.toml or forge.toml in ${contracts_dir}"
        log_error "Directory contents:"
        find "${contracts_dir}" -maxdepth 1 -printf '%f\n' 2>/dev/null | head -10 >&2 || true
        return "$EXIT_CONFIG_ERROR"
    fi

    log_success "Forge environment validation passed"
    return "$EXIT_SUCCESS"
}

# Run forge command with error handling
run_forge_command() {
    local command="$1"
    shift
    local args=("$@")

    log_debug "Running forge ${command} ${args[*]}"

    # Change to contracts directory for forge commands
    local contracts_dir="${PROJECT_ROOT}/contracts"
    if ! pushd "${contracts_dir}" > /dev/null 2>&1; then
        log_error "Failed to change to contracts directory: ${contracts_dir}"
        return "$EXIT_ERROR"
    fi

    local output
    if output=$(forge "${command}" "${args[@]}" 2>&1); then
        log_debug "Forge ${command} completed successfully"
        popd > /dev/null
        echo "${output}"
        return "$EXIT_SUCCESS"
    else
        log_error "Forge ${command} failed:"
        echo "${output}" >&2
        popd > /dev/null
        return "$EXIT_ERROR"
    fi
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
        return "$EXIT_ERROR"
    fi

    return "$EXIT_SUCCESS"
}

# ============================================================================
# EXPORT FUNCTIONS
# ============================================================================

# Export all functions so they're available to sourcing scripts
export -f log_info log_warn log_error log_success log_debug
export -f print_header print_separator
export -f command_exists validate_commands validate_file validate_directory validate_json
export -f backup_file ensure_directory
export -f confirm get_relative_path
export -f validate_forge_environment run_forge_command validate_directories