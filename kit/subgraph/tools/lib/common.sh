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

# Exit codes
readonly EXIT_SUCCESS=0
readonly EXIT_ERROR=1
readonly EXIT_INVALID_ARGS=2
readonly EXIT_MISSING_DEPS=3
readonly EXIT_CONFIG_ERROR=4

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
        if [[ -f "$current_dir/package.json" ]] && [[ -d "$current_dir/contracts" ]]; then
            PROJECT_ROOT="$current_dir"
            break
        fi
        current_dir="$(dirname "$current_dir")"
    done
    
    if [[ -z "$PROJECT_ROOT" ]]; then
        echo "Error: Could not find project root directory" >&2
        exit $EXIT_CONFIG_ERROR
    fi
    
    SUBGRAPH_DIR="${PROJECT_ROOT}/subgraph"
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
    local bash_lineno="${3:-$line_number}"
    
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
    if [[ -n "${BACKUP_FILES:-}" ]]; then
        for file in $BACKUP_FILES; do
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
        
        return $EXIT_MISSING_DEPS
    fi
    
    return $EXIT_SUCCESS
}

# Validate file exists and is readable
validate_file() {
    local file="$1"
    local description="${2:-File}"
    
    if [[ ! -f "$file" ]]; then
        log_error "$description not found: $file"
        return $EXIT_ERROR
    fi
    
    if [[ ! -r "$file" ]]; then
        log_error "$description is not readable: $file"
        return $EXIT_ERROR
    fi
    
    return $EXIT_SUCCESS
}

# Validate directory exists and is accessible
validate_directory() {
    local dir="$1"
    local description="${2:-Directory}"
    
    if [[ ! -d "$dir" ]]; then
        log_error "$description not found: $dir"
        return $EXIT_ERROR
    fi
    
    if [[ ! -r "$dir" ]] || [[ ! -x "$dir" ]]; then
        log_error "$description is not accessible: $dir"
        return $EXIT_ERROR
    fi
    
    return $EXIT_SUCCESS
}

# Validate JSON file
validate_json() {
    local file="$1"
    
    if ! jq empty "$file" 2>/dev/null; then
        log_error "Invalid JSON in file: $file"
        return $EXIT_ERROR
    fi
    
    return $EXIT_SUCCESS
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
        BACKUP_FILES="${BACKUP_FILES:-} $file"
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

# Find files with specific pattern
find_files() {
    local directory="$1"
    local pattern="$2"
    
    find "$directory" -name "$pattern" -type f -print0 2>/dev/null
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
                exit $EXIT_SUCCESS
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
# EXPORT FUNCTIONS
# ============================================================================

# Export all functions so they're available to sourcing scripts
export -f log_info log_warn log_error log_success log_debug
export -f print_header print_separator
export -f command_exists validate_commands validate_file validate_directory validate_json
export -f backup_file ensure_directory find_files
export -f confirm get_relative_path