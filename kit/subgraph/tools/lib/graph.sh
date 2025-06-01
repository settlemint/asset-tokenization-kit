#!/usr/bin/env bash
# graph.sh - Graph Protocol specific utilities for subgraph deployment
#
# This library provides:
# - Graph CLI command wrappers
# - Subgraph configuration management
# - Address replacement utilities
# - Deployment validation and verification
#
# Usage:
#   source "${SCRIPT_DIR}/lib/graph.sh"

# shellcheck disable=SC2154  # EXIT_* variables are defined in common.sh

# Prevent multiple sourcing
if [[ "${_GRAPH_LIB_LOADED:-}" == "true" ]]; then
    return 0
fi
readonly _GRAPH_LIB_LOADED="true"

# Source dependencies
source "${BASH_SOURCE%/*}/common.sh"

# ============================================================================
# CONSTANTS
# ============================================================================

# Default addresses (used for restoration)
readonly DEFAULT_SYSTEM_FACTORY_ADDRESS="0x5e771e1417100000000000000000000000020088"

# Deployment configurations
readonly LOCAL_GRAPH_NODE="http://localhost:8020"
readonly REMOTE_IPFS_NODE="https://ipfs.console.settlemint.com"

# File paths (initialized after PROJECT_ROOT and SUBGRAPH_DIR are set)
DEPLOYED_ADDRESSES_FILE=""
SUBGRAPH_YAML=""

# Graph configuration
GRAPH_NAME="${GRAPH_NAME:-smart}"
GRAPH_VERSION_PREFIX="${GRAPH_VERSION_PREFIX:-v1.0}"

# ============================================================================
# INITIALIZATION FUNCTIONS
# ============================================================================

# Initialize graph-specific paths after common library initialization
init_graph_paths() {
    if [[ -z "$PROJECT_ROOT" ]] || [[ -z "$SUBGRAPH_DIR" ]]; then
        log_error "PROJECT_ROOT and SUBGRAPH_DIR must be initialized before calling init_graph_paths"
        return "$EXIT_CONFIG_ERROR"
    fi
    
    DEPLOYED_ADDRESSES_FILE="${PROJECT_ROOT}/ignition/deployments/smart-protocol-local/deployed_addresses.json"
    SUBGRAPH_YAML="${SUBGRAPH_DIR}/subgraph.yaml"
    
    log_debug "Graph paths initialized:"
    log_debug "  DEPLOYED_ADDRESSES_FILE: $DEPLOYED_ADDRESSES_FILE"
    log_debug "  SUBGRAPH_YAML: $SUBGRAPH_YAML"
    
    return "$EXIT_SUCCESS"
}

# ============================================================================
# VALIDATION FUNCTIONS
# ============================================================================

# Validate graph environment
validate_graph_environment() {
    log_info "Validating Graph Protocol environment..."
    
    # Check required commands
    local required_commands=("npm" "npx" "jq" "yq")
    if ! validate_commands "${required_commands[@]}"; then
        return "$EXIT_MISSING_DEPS"
    fi
    
    # Check for graph-cli
    if ! npx graph --version &>/dev/null; then
        log_error "graph-cli not found. Please install with: npm install -g @graphprotocol/graph-cli"
        return "$EXIT_MISSING_DEPS"
    fi
    
    # Validate subgraph directory
    if ! validate_directory "$SUBGRAPH_DIR" "Subgraph directory"; then
        return "$EXIT_ERROR"
    fi
    
    # Validate subgraph.yaml
    if ! validate_file "$SUBGRAPH_YAML" "Subgraph configuration"; then
        return "$EXIT_ERROR"
    fi
    
    log_success "Graph environment validation passed"
    return "$EXIT_SUCCESS"
}

# Validate deployment environment
validate_deployment_environment() {
    local env="$1"
    
    case "$env" in
        local)
            if ! check_local_graph_node; then
                log_error "Local Graph node is not running at $LOCAL_GRAPH_NODE"
                log_info "Please start the Graph node with: docker-compose up -d"
                return "$EXIT_ERROR"
            fi
            ;;
        remote)
            if ! command_exists settlemint; then
                log_error "SettleMint CLI not found. Please install it first."
                return "$EXIT_MISSING_DEPS"
            fi
            
            if ! check_settlemint_auth; then
                log_error "Not authenticated with SettleMint. Please run: npx settlemint login"
                return "$EXIT_ERROR"
            fi
            ;;
        *)
            log_error "Invalid deployment environment: $env"
            return "$EXIT_INVALID_ARGS"
            ;;
    esac
    
    return "$EXIT_SUCCESS"
}

# Check if local graph node is running
check_local_graph_node() {
    log_debug "Checking local Graph node at $LOCAL_GRAPH_NODE"
    
    # Graph node expects POST requests, so we check if it responds with the expected error message
    local response
    response=$(curl -s "$LOCAL_GRAPH_NODE" 2>/dev/null || echo "")
    
    if [[ "$response" == *"POST or OPTIONS is required"* ]]; then
        log_debug "Local Graph node is accessible"
        return "$EXIT_SUCCESS"
    else
        return "$EXIT_ERROR"
    fi
}

# Check SettleMint authentication
check_settlemint_auth() {
    log_debug "Checking SettleMint authentication"
    
    if npx settlemint whoami &>/dev/null; then
        log_debug "SettleMint authentication valid"
        return "$EXIT_SUCCESS"
    else
        return "$EXIT_ERROR"
    fi
}

# ============================================================================
# ADDRESS MANAGEMENT
# ============================================================================

# Read deployed addresses
read_deployed_addresses() {
    log_info "Reading deployed contract addresses..."
    
    if ! validate_file "$DEPLOYED_ADDRESSES_FILE" "Deployed addresses file"; then
        return "$EXIT_ERROR"
    fi
    
    if ! validate_json "$DEPLOYED_ADDRESSES_FILE"; then
        return "$EXIT_ERROR"
    fi
    
    # Extract addresses using jq
    local system_factory_address
    system_factory_address=$(jq -r '.["SystemFactoryModule#SMARTSystemFactory"]' "$DEPLOYED_ADDRESSES_FILE" 2>/dev/null)
    
    if [[ -z "$system_factory_address" ]] || [[ "$system_factory_address" == "null" ]]; then
        log_error "Could not extract SystemFactory address from deployment file"
        log_error "Please ensure the contracts have been deployed successfully"
        return "$EXIT_ERROR"
    fi
    
    # Export for use in other functions
    export SYSTEM_FACTORY_ADDRESS="$system_factory_address"
    
    log_success "Successfully read deployed addresses"
    log_info "  SystemFactory: $SYSTEM_FACTORY_ADDRESS"
    
    return "$EXIT_SUCCESS"
}

# Update addresses in subgraph.yaml
update_subgraph_addresses() {
    log_info "Updating addresses in subgraph configuration..."
    
    # Backup the original file
    backup_file "$SUBGRAPH_YAML"
    
    # Update SystemFactory address
    if ! yq -i "(.dataSources[] | select(.name == \"SystemFactory\").source.address) = \"$SYSTEM_FACTORY_ADDRESS\"" "$SUBGRAPH_YAML"; then
        log_error "Failed to update SystemFactory address in subgraph.yaml"
        return "$EXIT_ERROR"
    fi
    
    log_success "Successfully updated subgraph addresses"
    return "$EXIT_SUCCESS"
}

# Restore default addresses
restore_default_addresses() {
    log_info "Restoring default addresses in subgraph configuration..."
    
    if ! yq -i "(.dataSources[] | select(.name == \"SystemFactory\").source.address) = \"$DEFAULT_SYSTEM_FACTORY_ADDRESS\"" "$SUBGRAPH_YAML"; then
        log_error "Failed to restore default addresses"
        return "$EXIT_ERROR"
    fi
    
    log_debug "Default addresses restored"
    return "$EXIT_SUCCESS"
}

# ============================================================================
# GRAPH OPERATIONS
# ============================================================================

# Generate subgraph code
generate_subgraph_code() {
    log_info "Generating subgraph code..."
    
    if ! cd "$PROJECT_ROOT"; then
        log_error "Failed to change to project root directory"
        return "$EXIT_ERROR"
    fi
    
    if ! npm run subgraph:codegen; then
        log_error "Failed to generate subgraph code"
        return "$EXIT_ERROR"
    fi
    
    log_success "Subgraph code generated successfully"
    return "$EXIT_SUCCESS"
}

# Create subgraph (local deployment)
create_local_subgraph() {
    local graph_name="${1:-$GRAPH_NAME}"
    
    log_info "Creating local subgraph: $graph_name"
    
    # Check if subgraph already exists
    if npx graph remove --node "$LOCAL_GRAPH_NODE" "$graph_name" &>/dev/null; then
        log_debug "Removed existing subgraph: $graph_name"
    fi
    
    if ! npx graph create --node "$LOCAL_GRAPH_NODE" "$graph_name"; then
        log_warn "Failed to create subgraph (it may already exist)"
    else
        log_success "Created subgraph: $graph_name"
    fi
    
    return "$EXIT_SUCCESS"
}

# Deploy subgraph locally
deploy_subgraph_local() {
    local graph_name="${1:-$GRAPH_NAME}"
    local version_label
    version_label="${GRAPH_VERSION_PREFIX}.$(date +%s)"
    
    log_info "Deploying subgraph locally..."
    log_info "  Name: $graph_name"
    log_info "  Version: $version_label"
    log_info "  Graph Node: $LOCAL_GRAPH_NODE"
    log_info "  IPFS: $REMOTE_IPFS_NODE"
    
    if ! npx graph deploy \
        --version-label "$version_label" \
        --node "$LOCAL_GRAPH_NODE" \
        --ipfs "$REMOTE_IPFS_NODE" \
        "$graph_name" \
        "$SUBGRAPH_YAML"; then
        log_error "Failed to deploy subgraph locally"
        return "$EXIT_ERROR"
    fi
    
    log_success "Subgraph deployed successfully!"
    log_info "  Access your subgraph at: ${LOCAL_GRAPH_NODE}/subgraphs/name/${graph_name}"
    
    return "$EXIT_SUCCESS"
}

# Deploy subgraph remotely (via SettleMint)
deploy_subgraph_remote() {
    log_info "Deploying subgraph to SettleMint..."
    
    if ! cd "$PROJECT_ROOT"; then
        log_error "Failed to change to project root directory"
        return "$EXIT_ERROR"
    fi
    
    if ! npx settlemint scs subgraph deploy; then
        log_error "Failed to deploy subgraph to SettleMint"
        return "$EXIT_ERROR"
    fi
    
    log_success "Subgraph deployed to SettleMint successfully!"
    
    return "$EXIT_SUCCESS"
}

# ============================================================================
# SUMMARY AND REPORTING
# ============================================================================

# Print deployment summary
print_deployment_summary() {
    local env="$1"
    local start_time="$2"
    local end_time
    end_time="$(date +%s)"
    local duration=$((end_time - start_time))
    
    print_separator
    log_success "Deployment completed successfully!"
    echo
    log_info "Summary:"
    log_info "  Environment: $env"
    log_info "  Duration: ${duration}s"
    log_info "  Graph Name: $GRAPH_NAME"
    
    if [[ "$env" == "local" ]]; then
        log_info "  Graph Node: $LOCAL_GRAPH_NODE"
        log_info "  Subgraph URL: ${LOCAL_GRAPH_NODE}/subgraphs/name/${GRAPH_NAME}"
    else
        log_info "  Platform: SettleMint"
    fi
    
    echo
    log_info "Contract Addresses Used:"
    log_info "  SystemFactory: ${SYSTEM_FACTORY_ADDRESS:-Unknown}"
    print_separator
}

# ============================================================================
# HIGH-LEVEL WORKFLOW FUNCTIONS
# ============================================================================

# Complete local deployment workflow
deploy_local_workflow() {
    local start_time
    start_time="$(date +%s)"
    
    print_header "Deploying Subgraph Locally"
    
    # Validate environment
    if ! validate_deployment_environment "local"; then
        return "$EXIT_ERROR"
    fi
    
    # Read and update addresses
    if ! read_deployed_addresses; then
        return "$EXIT_ERROR"
    fi
    
    if ! update_subgraph_addresses; then
        return "$EXIT_ERROR"
    fi
    
    # Generate code
    if ! generate_subgraph_code; then
        return "$EXIT_ERROR"
    fi
    
    # Create and deploy
    if ! create_local_subgraph "$GRAPH_NAME"; then
        return "$EXIT_ERROR"
    fi
    
    if ! deploy_subgraph_local "$GRAPH_NAME"; then
        return "$EXIT_ERROR"
    fi
    
    # Print summary
    print_deployment_summary "local" "$start_time"
    
    return "$EXIT_SUCCESS"
}

# Complete remote deployment workflow
deploy_remote_workflow() {
    local start_time
    start_time="$(date +%s)"
    
    print_header "Deploying Subgraph to SettleMint"
    
    # Validate environment
    if ! validate_deployment_environment "remote"; then
        return "$EXIT_ERROR"
    fi
    
    # Read and update addresses
    if ! read_deployed_addresses; then
        return "$EXIT_ERROR"
    fi
    
    if ! update_subgraph_addresses; then
        return "$EXIT_ERROR"
    fi
    
    # Generate code and deploy
    if ! generate_subgraph_code; then
        return "$EXIT_ERROR"
    fi
    
    if ! deploy_subgraph_remote; then
        return "$EXIT_ERROR"
    fi
    
    # Print summary
    print_deployment_summary "remote" "$start_time"
    
    return "$EXIT_SUCCESS"
}