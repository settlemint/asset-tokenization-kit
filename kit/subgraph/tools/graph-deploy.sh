#!/usr/bin/env bash
# graph-deploy.sh - Deploy SMART Protocol subgraph to local or remote Graph node
#
# This script handles the deployment of the SMART Protocol subgraph by:
# 1. Reading deployed contract addresses from Hardhat Ignition
# 2. Updating the subgraph configuration with actual addresses
# 3. Generating TypeScript code from the GraphQL schema
# 4. Deploying to either a local Graph node or SettleMint
#
# Usage:
#   ./graph-deploy.sh --local    # Deploy to local Graph node
#   ./graph-deploy.sh --remote   # Deploy to SettleMint

# shellcheck disable=SC2154  # SCRIPT_NAME and other variables are set by init_common_lib

# Get script directory and source libraries
TOOLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly TOOLS_DIR
source "${TOOLS_DIR}/lib/all.sh"

# Initialize the common library
init_common_lib "graph-deploy.sh"

# ============================================================================
# SCRIPT CONFIGURATION
# ============================================================================

# Script-specific variables
DEPLOYMENT_ENV=""

# ============================================================================
# FUNCTIONS
# ============================================================================

# Show script usage
show_usage() {
    cat << EOF
Usage: $SCRIPT_NAME --local|--remote [OPTIONS]

Deploy the SMART Protocol subgraph to a Graph node.

Arguments:
  --local     Deploy to local Graph node (localhost:8020)
  --remote    Deploy to SettleMint platform

Options:
  -h, --help      Show this help message
  -v, --verbose   Enable verbose output
  -q, --quiet     Suppress informational output
  -d, --debug     Enable debug mode (implies verbose)

Examples:
  # Deploy to local Graph node
  $SCRIPT_NAME --local

  # Deploy to SettleMint with verbose output
  $SCRIPT_NAME --remote --verbose

Requirements:
  - Contracts must be deployed (deployed_addresses.json must exist)
  - For local deployment: Graph node running at localhost:8020
  - For remote deployment: SettleMint CLI installed and authenticated

EOF
}

# Parse command line arguments
parse_arguments() {
    local args=()

    # First pass: extract common arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -h|--help|-v|--verbose|-q|--quiet|-d|--debug)
                # These are handled by parse_common_arguments
                args+=("$1")
                ;;
            --local|--remote)
                if [[ -n "$DEPLOYMENT_ENV" ]]; then
                    log_error "Deployment environment already specified as: $DEPLOYMENT_ENV"
                    log_error "Cannot specify both --local and --remote"
                    exit "$EXIT_INVALID_ARGS"
                fi
                DEPLOYMENT_ENV="${1#--}"
                ;;
            *)
                log_error "Unknown argument: $1"
                show_usage
                exit "$EXIT_INVALID_ARGS"
                ;;
        esac
        shift
    done

    # Let common library parse its arguments
    parse_common_arguments "${args[*]:-}"

    # Validate deployment environment
    if [[ -z "$DEPLOYMENT_ENV" ]]; then
        log_error "Deployment environment not specified"
        log_error "Please use either --local or --remote"
        show_usage
        exit "$EXIT_INVALID_ARGS"
    fi
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    # Parse arguments
    parse_arguments "$@"

    # Show deployment header
    print_header "SMART Protocol Subgraph Deployment"
    log_info "Deployment target: $DEPLOYMENT_ENV"
    log_info "Project root: $(get_relative_path "$PROJECT_ROOT" "$PWD")"

    # Initialize graph-specific paths
    if ! init_graph_paths; then
        exit "$EXIT_ERROR"
    fi

    # Validate environment
    if ! validate_graph_environment; then
        exit "$EXIT_ERROR"
    fi

    # Set up cleanup to restore addresses on exit
    trap 'restore_default_addresses' EXIT

    # Execute deployment workflow
    case "$DEPLOYMENT_ENV" in
        local)
            deploy_local_workflow
            ;;
        remote)
            deploy_remote_workflow
            ;;
        *)
            log_error "Invalid deployment environment: $DEPLOYMENT_ENV"
            exit "$EXIT_INVALID_ARGS"
            ;;
    esac

    local exit_code=$?

    exit $exit_code
}

# Run main function
main "$@"