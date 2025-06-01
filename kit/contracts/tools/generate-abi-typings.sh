#!/usr/bin/env bash
# generate-abi-typings.sh - Generate TypeScript typings from Hardhat contract ABIs
#
# This script extracts ABI definitions from Hardhat artifacts and generates
# TypeScript constant exports for use in the deployment and testing scripts.
#
# Usage:
#   ./generate-abi-typings.sh              # Generate all ABIs
#   ./generate-abi-typings.sh --list       # List available ABI names
#   ./generate-abi-typings.sh bond equity  # Generate specific ABIs

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
init_common_lib "generate-abi-typings.sh"

# Set up cleanup trap
trap 'script_cleanup $?' EXIT

# =============================================================================
# SCRIPT-SPECIFIC VARIABLES
# =============================================================================

OPERATION_MODE="generate-all"
SPECIFIC_ABIS=()
SKIP_BUILD="${SKIP_BUILD:-false}"

# =============================================================================
# SCRIPT-SPECIFIC FUNCTIONS
# =============================================================================

# Script-specific cleanup function
script_cleanup() {
    local exit_code="$1"
    if [[ ${exit_code} -eq 0 ]]; then
        log_info "ABI typings generation completed successfully"
    fi
}

# Show script usage
show_usage() {
    cat << EOF
Usage: ${SCRIPT_NAME} [OPTIONS] [ABI_NAMES...]

Generate TypeScript typings from Hardhat contract ABIs.

OPTIONS:
    -h, --help              Show this help message
    -v, --verbose           Enable verbose output
    -q, --quiet             Suppress informational output
    -l, --list              List all available ABI names
    --skip-build            Skip contract compilation step

ARGUMENTS:
    ABI_NAMES               Specific ABI names to generate (optional)
                           If not specified, all ABIs will be generated

EXAMPLES:
    # Generate all ABI typings
    ${SCRIPT_NAME}

    # List available ABI names
    ${SCRIPT_NAME} --list

    # Generate specific ABIs only
    ${SCRIPT_NAME} bond equity fund

    # Generate with verbose output
    ${SCRIPT_NAME} --verbose

    # Skip compilation and generate from existing artifacts
    ${SCRIPT_NAME} --skip-build

PREREQUISITES:
    - Contracts must be compiled with Hardhat (artifacts must exist)
    - jq must be installed for JSON processing

OUTPUT:
    TypeScript files will be generated in: scripts/hardhat/abi/

AVAILABLE ABI NAMES:
    Onboarding:
      system, compliance, identityRegistry, identityRegistryStorage,
      trustedIssuersRegistry, topicSchemeRegistry, identityFactory,
      bondFactory, depositFactory, equityFactory, fundFactory, stablecoinFactory

    Token Infrastructure:
      accessManager, identity, tokenIdentity

    Asset Tokens:
      deposit, equity, fund, stablecoin, bond

    Core SMART:
      ismart, ismartBurnable

EOF
}

# Parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
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
            -l|--list)
                OPERATION_MODE="list"
                ;;
            --skip-build)
                SKIP_BUILD="true"
                log_info "Skip build mode enabled"
                ;;
            -*)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
            *)
                # Treat as ABI name
                OPERATION_MODE="generate-specific"
                SPECIFIC_ABIS+=("$1")
                ;;
        esac
        shift
    done
}

# Compile contracts if needed
compile_contracts() {
    if [[ "${SKIP_BUILD}" == "true" ]]; then
        log_info "Skipping contract compilation"
        return 0
    fi

    log_info "Compiling contracts with Hardhat..."

    # Change to project root for npm commands
    if ! pushd "${PROJECT_ROOT}" > /dev/null 2>&1; then
        log_error "Failed to change to project directory: ${PROJECT_ROOT}"
        return 1
    fi

    local output
    # Use the direct hardhat build command to avoid recursion
    if output=$(settlemint scs hardhat build 2>&1); then
        log_success "Contracts compiled successfully"
        popd > /dev/null
        return 0
    else
        log_error "Failed to compile contracts:"
        echo "${output}" >&2
        popd > /dev/null
        return 1
    fi
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

main() {
    log_info "Starting ${SCRIPT_NAME}..."
    log_info "Script directory: ${SCRIPT_DIR}"
    log_info "Project root: ${PROJECT_ROOT}"

    # Parse arguments
    parse_arguments "$@"

    # Validate environment
    validate_forge_environment
    validate_commands "jq" "npm"

    # Execute based on operation mode
    local exit_code=0
    case "$OPERATION_MODE" in
        list)
            list_abi_names
            exit_code=$?
            ;;
        generate-all)
            # Compile contracts first
            if ! compile_contracts; then
                exit_code=1
            else
                # Generate all ABI typings using the library function
                generate_all_abi_typings
                exit_code=$?
            fi
            ;;
        generate-specific)
            # Compile contracts first
            if ! compile_contracts; then
                exit_code=1
            else
                # Generate specific ABI typings using the library function
                generate_specific_abi_typings "${SPECIFIC_ABIS[@]}"
                exit_code=$?
            fi
            ;;
    esac

    exit $exit_code
}

# Only run main if script is executed directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi