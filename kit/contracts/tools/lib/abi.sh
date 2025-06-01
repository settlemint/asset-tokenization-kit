#!/usr/bin/env bash
# abi.sh - ABI extraction and TypeScript generation utilities
#
# This library provides:
# - ABI file path definitions
# - ABI extraction from Hardhat artifacts
# - TypeScript constant generation
# - Validation of artifact files
#
# Usage:
#   source "${SCRIPT_DIR}/lib/abi.sh"

# Prevent multiple sourcing
if [[ "${_ABI_LIB_LOADED:-}" == "true" ]]; then
    return 0
fi
readonly _ABI_LIB_LOADED="true"

# Source dependencies
source "${BASH_SOURCE%/*}/common.sh"

# Import functions we need that might not be in all common.sh versions
if ! command -v print_header &> /dev/null; then
    # Define print_header if it doesn't exist
    print_header() {
        if [[ "${QUIET_MODE:-false}" != "true" ]]; then
            echo
            echo "=================================================="
            echo "$*"
            echo "=================================================="
            echo
        fi
    }
fi

if ! command -v print_separator &> /dev/null; then
    # Define print_separator if it doesn't exist
    print_separator() {
        if [[ "${QUIET_MODE:-false}" != "true" ]]; then
            echo "--------------------------------------------------"
        fi
    }
fi

# ============================================================================
# CONSTANTS
# ============================================================================

# Exit codes if not defined
if [[ -z "${EXIT_SUCCESS:-}" ]]; then
    readonly EXIT_SUCCESS=0
    readonly EXIT_ERROR=1
    readonly EXIT_INVALID_ARGS=2
    readonly EXIT_MISSING_DEPS=3
    readonly EXIT_CONFIG_ERROR=4
fi

# Base paths - these will be set properly when PROJECT_ROOT is available
ARTIFACTS_BASE_PATH=""
ABI_OUTPUT_PATH=""

# Declare associative array for ABI paths
declare -A ABI_PATHS

# Initialize ABI paths (called after PROJECT_ROOT is set)
initialize_abi_paths() {
    if [[ -z "${PROJECT_ROOT:-}" ]]; then
        log_error "PROJECT_ROOT not set - cannot initialize ABI paths"
        return 1
    fi

    # Set base paths
    ARTIFACTS_BASE_PATH="${PROJECT_ROOT}/artifacts/contracts"
    ABI_OUTPUT_PATH="${PROJECT_ROOT}/scripts/hardhat/abi"

    # Initialize ABI paths
    ABI_PATHS=(
        # Onboarding
        ["system"]="${ARTIFACTS_BASE_PATH}/system/ISMARTSystem.sol/ISMARTSystem.json"
        ["compliance"]="${ARTIFACTS_BASE_PATH}/interface/ISMARTCompliance.sol/ISMARTCompliance.json"
        ["identityRegistry"]="${ARTIFACTS_BASE_PATH}/interface/ISMARTIdentityRegistry.sol/ISMARTIdentityRegistry.json"
        ["identityRegistryStorage"]="${ARTIFACTS_BASE_PATH}/interface/ISMARTIdentityRegistryStorage.sol/ISMARTIdentityRegistryStorage.json"
        ["trustedIssuersRegistry"]="${ARTIFACTS_BASE_PATH}/interface/ERC-3643/IERC3643TrustedIssuersRegistry.sol/IERC3643TrustedIssuersRegistry.json"
        ["topicSchemeRegistry"]="${ARTIFACTS_BASE_PATH}/system/topic-scheme-registry/SMARTTopicSchemeRegistryImplementation.sol/SMARTTopicSchemeRegistryImplementation.json"
        ["identityFactory"]="${ARTIFACTS_BASE_PATH}/system/identity-factory/ISMARTIdentityFactory.sol/ISMARTIdentityFactory.json"
        ["bondFactory"]="${ARTIFACTS_BASE_PATH}/assets/bond/ISMARTBondFactory.sol/ISMARTBondFactory.json"
        ["depositFactory"]="${ARTIFACTS_BASE_PATH}/assets/deposit/SMARTDepositFactoryImplementation.sol/SMARTDepositFactoryImplementation.json"
        ["equityFactory"]="${ARTIFACTS_BASE_PATH}/assets/equity/ISMARTEquityFactory.sol/ISMARTEquityFactory.json"
        ["fundFactory"]="${ARTIFACTS_BASE_PATH}/assets/fund/ISMARTFundFactory.sol/ISMARTFundFactory.json"
        ["stablecoinFactory"]="${ARTIFACTS_BASE_PATH}/assets/stable-coin/ISMARTStableCoinFactory.sol/ISMARTStableCoinFactory.json"

        # Token
        ["accessManager"]="${ARTIFACTS_BASE_PATH}/extensions/access-managed/ISMARTTokenAccessManager.sol/ISMARTTokenAccessManager.json"
        ["identity"]="${ARTIFACTS_BASE_PATH}/system/identity-factory/identities/SMARTIdentityImplementation.sol/SMARTIdentityImplementation.json"
        ["tokenIdentity"]="${ARTIFACTS_BASE_PATH}/system/identity-factory/identities/SMARTTokenIdentityImplementation.sol/SMARTTokenIdentityImplementation.json"

        # Tokens
        ["deposit"]="${ARTIFACTS_BASE_PATH}/assets/deposit/SMARTDepositImplementation.sol/SMARTDepositImplementation.json"
        ["equity"]="${ARTIFACTS_BASE_PATH}/assets/equity/ISMARTEquity.sol/ISMARTEquity.json"
        ["fund"]="${ARTIFACTS_BASE_PATH}/assets/fund/ISMARTFund.sol/ISMARTFund.json"
        ["stablecoin"]="${ARTIFACTS_BASE_PATH}/assets/stable-coin/ISMARTStableCoin.sol/ISMARTStableCoin.json"
        ["bond"]="${ARTIFACTS_BASE_PATH}/assets/bond/ISMARTBond.sol/ISMARTBond.json"

        # SMART
        ["ismart"]="${ARTIFACTS_BASE_PATH}/interface/ISMART.sol/ISMART.json"
        ["ismartBurnable"]="${ARTIFACTS_BASE_PATH}/extensions/burnable/ISMARTBurnable.sol/ISMARTBurnable.json"
    )
}

# ============================================================================
# VALIDATION FUNCTIONS
# ============================================================================

# Validate that artifacts exist
validate_artifacts() {
    log_info "Validating Hardhat artifacts..."

    # Check if directory exists
    if [[ ! -d "$ARTIFACTS_BASE_PATH" ]]; then
        log_error "Artifacts directory not found: $ARTIFACTS_BASE_PATH"
        log_error "Please run 'npm run compile:hardhat' first."
        return $EXIT_ERROR
    fi

    # Check if at least one artifact exists
    local found_any=false
    for artifact_path in "${ABI_PATHS[@]}"; do
        if [[ -f "$artifact_path" ]]; then
            found_any=true
            break
        fi
    done

    if [[ "$found_any" != "true" ]]; then
        log_error "No artifacts found. Please run 'npm run compile:hardhat' first."
        return $EXIT_ERROR
    fi

    log_success "Artifacts validation passed"
    return $EXIT_SUCCESS
}

# Validate a single artifact file
validate_artifact_file() {
    local name="$1"
    local path="$2"

    # Check if file exists
    if [[ ! -f "$path" ]]; then
        log_debug "$name artifact not found: $path"
        return $EXIT_ERROR
    fi

    # Check if file is readable
    if [[ ! -r "$path" ]]; then
        log_error "$name artifact is not readable: $path"
        return $EXIT_ERROR
    fi

    # Validate JSON
    if ! jq empty "$path" 2>/dev/null; then
        log_error "Invalid JSON in artifact: $name"
        return $EXIT_ERROR
    fi

    # Check if ABI field exists
    if ! jq -e '.abi' "$path" >/dev/null 2>&1; then
        log_error "No ABI field found in artifact: $name"
        return $EXIT_ERROR
    fi

    return $EXIT_SUCCESS
}

# ============================================================================
# ABI PROCESSING FUNCTIONS
# ============================================================================

# Extract ABI from artifact file
extract_abi() {
    local artifact_path="$1"

    # Extract just the ABI array
    local abi_content
    if ! abi_content=$(jq '.abi' "$artifact_path" 2>/dev/null); then
        log_error "Failed to extract ABI from $artifact_path"
        return $EXIT_ERROR
    fi

    # Validate it's not empty
    if [[ "$abi_content" == "null" ]] || [[ -z "$abi_content" ]]; then
        log_error "Empty ABI in $artifact_path"
        return $EXIT_ERROR
    fi

    echo "$abi_content"
    return $EXIT_SUCCESS
}

# Generate TypeScript constant from ABI
generate_typescript_constant() {
    local name="$1"
    local abi_content="$2"
    local output_file="$3"

    # Format the ABI with proper indentation
    local formatted_abi
    if ! formatted_abi=$(echo "$abi_content" | jq . 2>/dev/null); then
        log_error "Failed to format ABI for $name"
        return $EXIT_ERROR
    fi

    # Create TypeScript content
    cat > "$output_file" << EOF
export const ${name}Abi = ${formatted_abi} as const;
EOF

    return $EXIT_SUCCESS
}

# Process a single ABI file
process_abi_file() {
    local name="$1"
    local artifact_path="$2"
    local output_file="${ABI_OUTPUT_PATH}/${name}.ts"

    log_debug "Processing $name from $artifact_path..."

    # Validate artifact
    if ! validate_artifact_file "$name" "$artifact_path"; then
        log_warn "Skipping $name - artifact not found or invalid"
        return $EXIT_ERROR
    fi

    # Extract ABI
    local abi_content
    if ! abi_content=$(extract_abi "$artifact_path"); then
        return $EXIT_ERROR
    fi

    # Generate TypeScript file
    if ! generate_typescript_constant "$name" "$abi_content" "$output_file"; then
        return $EXIT_ERROR
    fi

    log_debug "Generated $output_file"
    return $EXIT_SUCCESS
}

# ============================================================================
# SUMMARY FUNCTIONS
# ============================================================================

# ============================================================================
# HIGH-LEVEL WORKFLOW FUNCTIONS
# ============================================================================

# Generate all ABI typings
generate_all_abi_typings() {
    local processed=0
    local skipped=0
    local failed=0

    # Initialize ABI paths
    if ! initialize_abi_paths; then
        return $EXIT_ERROR
    fi

    # Validate environment
    if ! validate_artifacts; then
        return $EXIT_ERROR
    fi

    # Create output directory
    log_info "Creating output directory..."
    mkdir -p "$ABI_OUTPUT_PATH"

    # Process each ABI
    log_info "Processing ${#ABI_PATHS[@]} contract ABIs..."

    local progress=0
    for name in "${!ABI_PATHS[@]}"; do
        progress=$((progress + 1))

        log_info "Processing $name..."
        if process_abi_file "$name" "${ABI_PATHS[$name]}"; then
            processed=$((processed + 1))
        else
            failed=$((failed + 1))
        fi
    done

    # Print summary
    log_info "Processing summary: $processed processed, $failed failed"

    if [[ $failed -gt 0 ]]; then
        log_warn "Some ABIs failed to process. Please check the logs above."
        return $EXIT_ERROR
    fi

    log_success "ABI typings generated successfully!"
    return $EXIT_SUCCESS
}

# Generate specific ABI typings
generate_specific_abi_typings() {
    local abi_names=("$@")
    local processed=0
    local failed=0

    # Initialize ABI paths
    if ! initialize_abi_paths; then
        return $EXIT_ERROR
    fi

    # Validate environment
    if ! validate_artifacts; then
        return $EXIT_ERROR
    fi

    # Create output directory
    mkdir -p "$ABI_OUTPUT_PATH"

    # Process specified ABIs
    log_info "Processing ${#abi_names[@]} specified ABIs..."

    for name in "${abi_names[@]}"; do
        if [[ -z "${ABI_PATHS[$name]:-}" ]]; then
            log_error "Unknown ABI name: $name"
            failed=$((failed + 1))
            continue
        fi

        log_info "Processing $name..."
        if process_abi_file "$name" "${ABI_PATHS[$name]}"; then
            processed=$((processed + 1))
            log_debug "Successfully processed $name"
        else
            failed=$((failed + 1))
            log_debug "Failed to process $name"
        fi
    done

    # Print summary
    log_info "Processing summary: $processed processed, $failed failed"

    if [[ $failed -gt 0 ]]; then
        return $EXIT_ERROR
    fi

    log_success "ABI typings generated successfully!"
    return $EXIT_SUCCESS
}

# List available ABI names
list_abi_names() {
    # Initialize ABI paths
    if ! initialize_abi_paths; then
        return $EXIT_ERROR
    fi

    log_info "Available ABI names:"
    echo

    # Group by category
    echo -e "${PURPLE}Onboarding:${NC}"
    for name in system compliance identityRegistry identityRegistryStorage trustedIssuersRegistry topicSchemeRegistry identityFactory bondFactory depositFactory equityFactory fundFactory stablecoinFactory; do
        echo "  - $name"
    done

    echo
    echo -e "${PURPLE}Token Infrastructure:${NC}"
    for name in accessManager identity tokenIdentity; do
        echo "  - $name"
    done

    echo
    echo -e "${PURPLE}Asset Tokens:${NC}"
    for name in deposit equity fund stablecoin bond; do
        echo "  - $name"
    done

    echo
    echo -e "${PURPLE}Core SMART:${NC}"
    for name in ismart ismartBurnable; do
        echo "  - $name"
    done
}