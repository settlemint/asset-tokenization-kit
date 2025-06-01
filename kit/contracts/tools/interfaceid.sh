#!/usr/bin/env bash

# interfaceid.sh - Robust ERC165 Interface ID Calculator
# This script calculates ERC165 interface IDs for all interfaces starting with capital "I"

# =============================================================================
# LIBRARY IMPORTS
# =============================================================================

# shellcheck disable=SC2154  # PROJECT_ROOT and SCRIPT_NAME are set by init_common_lib

# Get script directory and source libraries
declare SCRIPT_DIR
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR
source "${SCRIPT_DIR}/lib/all.sh"

# =============================================================================
# SCRIPT INITIALIZATION
# =============================================================================

# Initialize the common library
# shellcheck disable=SC2154
init_common_lib "interfaceid.sh"

# Set up cleanup trap
trap 'script_cleanup $?' EXIT

# =============================================================================
# SCRIPT-SPECIFIC VARIABLES
# =============================================================================

FORCE_OVERWRITE="${FORCE_OVERWRITE:-false}"
SKIP_BUILD="${SKIP_BUILD:-false}"
OUTPUT_DIR="${OUTPUT_DIR:-subgraph/src/erc165/utils}"
OUTPUT_FILE="${OUTPUT_FILE:-interfaceids.ts}"
TEMP_CONTRACT="${TEMP_CONTRACT:-temp_interface_calc.sol}"

# Processing counters
declare -i INTERFACES_FOUND=0
declare -i INTERFACES_PROCESSED=0
declare -i INTERFACES_FAILED=0

# Arrays for interface data
declare -a INTERFACE_NAMES=()
declare -a INTERFACE_IMPORTS=()
declare -a INTERFACE_FILES=()

# =============================================================================
# SCRIPT-SPECIFIC FUNCTIONS
# =============================================================================

# Script-specific cleanup function
script_cleanup() {
    local exit_code="$1"

    # Clean up temporary files
    cleanup_temp_files

    if [[ ${exit_code} -eq 0 ]]; then
        log_info "Processing summary: ${INTERFACES_FOUND} found, ${INTERFACES_PROCESSED} processed, ${INTERFACES_FAILED} failed"
    fi
}

# Clean up temporary files
cleanup_temp_files() {
    local temp_files=(
        "${PROJECT_ROOT}/${TEMP_CONTRACT}"
        "${PROJECT_ROOT}/temp_single_calc.sol"
    )

    for temp_file in "${temp_files[@]}"; do
        if [[ -f "${temp_file}" ]]; then
            if rm -f "${temp_file}"; then
                log_debug "Cleaned up temporary file: ${temp_file}"
            else
                log_warn "Failed to clean up temporary file: ${temp_file}"
            fi
        fi
    done
}

# Show usage information
show_usage() {
    cat << EOF
Usage: ${SCRIPT_NAME} [OPTIONS]

This script calculates ERC165 interface IDs for all interfaces starting with capital "I".

OPTIONS:
    -h, --help              Show this help message
    -v, --verbose           Enable verbose logging (DEBUG level)
    -q, --quiet             Enable quiet mode (ERROR level only)
    -f, --force             Force overwrite existing output files
    --skip-build            Skip contract compilation step
    -o, --output-dir DIR    Set output directory (default: ${OUTPUT_DIR})
    --output-file FILE      Set output filename (default: ${OUTPUT_FILE})
    --temp-contract FILE    Set temporary contract filename (default: ${TEMP_CONTRACT})

ENVIRONMENT VARIABLES:
    LOG_LEVEL               Set logging level (DEBUG, INFO, WARN, ERROR)
    OUTPUT_DIR              Set output directory
    OUTPUT_FILE             Set output filename
    FORCE_OVERWRITE         Set to 'true' to overwrite existing files
    SKIP_BUILD              Set to 'true' to skip compilation

EXAMPLES:
    ${SCRIPT_NAME}                    # Run with default settings
    ${SCRIPT_NAME} --verbose          # Run with verbose output
    ${SCRIPT_NAME} --force            # Force overwrite existing files
    ${SCRIPT_NAME} --skip-build       # Skip compilation step
    ${SCRIPT_NAME} -o src/interfaces  # Use custom output directory

PREREQUISITES:
    - Forge project with foundry.toml or forge.toml
    - Foundry toolchain (forge command)
    - Interface contracts in contracts/ directory starting with "I"

EOF
}

# Parse script-specific arguments
parse_script_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -v|--verbose)
                export LOG_LEVEL="DEBUG"
                log_info "Verbose mode enabled"
                ;;
            -q|--quiet)
                export LOG_LEVEL="ERROR"
                ;;
            -f|--force)
                FORCE_OVERWRITE="true"
                log_info "Force overwrite mode enabled"
                ;;
            --skip-build)
                SKIP_BUILD="true"
                log_info "Skip build mode enabled"
                ;;
            -o|--output-dir)
                if [[ -n "${2-}" ]]; then
                    OUTPUT_DIR="$2"
                    log_info "Output directory set to: ${OUTPUT_DIR}"
                    shift
                else
                    log_error "Option --output-dir requires a directory path"
                    exit 1
                fi
                ;;
            --output-file)
                if [[ -n "${2-}" ]]; then
                    OUTPUT_FILE="$2"
                    log_info "Output file set to: ${OUTPUT_FILE}"
                    shift
                else
                    log_error "Option --output-file requires a filename"
                    exit 1
                fi
                ;;
            --temp-contract)
                if [[ -n "${2-}" ]]; then
                    TEMP_CONTRACT="$2"
                    log_info "Temporary contract file set to: ${TEMP_CONTRACT}"
                    shift
                else
                    log_error "Option --temp-contract requires a filename"
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

# Find all interface files starting with "I"
find_interface_files() {
    log_info "Searching for interface files..."

    local contracts_dir="${PROJECT_ROOT}/contracts"

    if [[ ! -d "${contracts_dir}" ]]; then
        log_error "Contracts directory not found: ${contracts_dir}"
        return 1
    fi

    # Find all interface files starting with "I"
    local found_files=()
    while IFS= read -r -d '' file; do
        found_files+=("$file")
    done < <(find "${contracts_dir}" -name "I*.sol" -type f -print0 2>/dev/null || true)

    if [[ ${#found_files[@]} -eq 0 ]]; then
        log_error "No interface files starting with 'I' found in ${contracts_dir}"
        return 1
    fi

    # Sort the files for consistent processing
    mapfile -t INTERFACE_FILES < <(printf '%s\n' "${found_files[@]}" | sort)

    INTERFACES_FOUND=${#INTERFACE_FILES[@]}
    log_success "Found ${INTERFACES_FOUND} interface files:"

    for file in "${INTERFACE_FILES[@]}"; do
        local relative_path="${file#"${PROJECT_ROOT}"/}"
        log_info "  - ${relative_path}"
    done
}

# Extract interface names and create import statements
extract_interface_metadata() {
    log_info "Extracting interface names and metadata..."

    INTERFACE_NAMES=()
    INTERFACE_IMPORTS=()

    for file in "${INTERFACE_FILES[@]}"; do
        local interface_name
        interface_name=$(basename "${file}" .sol)

        # Skip if not starting with I (double check)
        if [[ ! "${interface_name}" =~ ^I[A-Z] ]]; then
            log_warn "Skipping ${interface_name}: does not match interface naming pattern"
            continue
        fi

        # Check if the file actually contains an interface declaration
        if grep -E -q "^[[:space:]]*interface[[:space:]]+${interface_name}([[:space:]]+|$)" "${file}"; then
            INTERFACE_NAMES+=("${interface_name}")

            # Convert file path to import path (keep the full path from contracts/)
            local relative_path="${file#"${PROJECT_ROOT}"/}"
            local import_path="./${relative_path}"
            INTERFACE_IMPORTS+=("import { ${interface_name} } from \"${import_path}\";")

            log_success "  ✓ ${interface_name}"
        else
            log_warn "  ✗ ${interface_name}: No interface declaration found"
            INTERFACES_FAILED=$((INTERFACES_FAILED + 1))
        fi
    done

    if [[ ${#INTERFACE_NAMES[@]} -eq 0 ]]; then
        log_error "No valid interfaces found"
        return 1
    fi

    INTERFACES_PROCESSED=${#INTERFACE_NAMES[@]}
    log_success "Found ${INTERFACES_PROCESSED} valid interfaces"
}

# Create dynamic Solidity contract to calculate interface IDs
create_calculator_contract() {
    log_info "Creating dynamic interface ID calculator..."

    local temp_contract="${PROJECT_ROOT}/${TEMP_CONTRACT}"

    # Create the contract header
    cat > "${temp_contract}" << 'EOF'
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "forge-std/console.sol";

// Import all discovered interfaces
EOF

    # Add all interface imports
    for import_line in "${INTERFACE_IMPORTS[@]}"; do
        echo "${import_line}" >> "${temp_contract}"
    done

    # Add the contract definition
    cat >> "${temp_contract}" << 'EOF'

contract InterfaceIdCalculator is Script {
    function run() external {
        console.log("=== SMART Protocol Interface IDs ===");
        console.log("");

EOF

    # Add console.log statements for each interface
    for interface_name in "${INTERFACE_NAMES[@]}"; do
        echo "        console.log(\"${interface_name}: %s\", vm.toString(bytes4(type(${interface_name}).interfaceId)));" >> "${temp_contract}"
    done

    # Add TypeScript format section
    cat >> "${temp_contract}" << 'EOF'

        console.log("");
        console.log("=== TypeScript Format ===");
        console.log("export class InterfaceIds {");
EOF

    # Add TypeScript static properties for each interface
    for interface_name in "${INTERFACE_NAMES[@]}"; do
        echo "        console.log('  static ${interface_name}: Bytes = Bytes.fromHexString(\"%s\");', vm.toString(bytes4(type(${interface_name}).interfaceId)));" >> "${temp_contract}"
    done

    cat >> "${temp_contract}" << 'EOF'
        console.log("}");
    }
}
EOF

    log_success "Dynamic interface ID calculator created: ${temp_contract}"
}

# Compile contracts if needed
compile_contracts() {
    if [[ "${SKIP_BUILD}" == "true" ]]; then
        log_info "Skipping contract compilation"
        return 0
    fi

    log_info "Compiling contracts..."

    if run_forge_command "build" "--silent" > /dev/null; then
        log_success "Contracts compiled successfully"
    else
        log_error "Contract compilation failed"
        return 1
    fi
}

# Calculate interface IDs using the dynamic contract
calculate_interface_ids() {
    log_info "Calculating interface IDs..."

    local temp_contract="${PROJECT_ROOT}/${TEMP_CONTRACT}"

    if [[ ! -f "${temp_contract}" ]]; then
        log_error "Temporary contract not found: ${temp_contract}"
        return 1
    fi

    # Run the forge script and capture output
    local script_output
    if ! script_output=$(run_forge_command "script" "${temp_contract}:InterfaceIdCalculator" 2>&1); then
        log_error "Failed to calculate interface IDs"
        echo "${script_output}" >&2
        return 1
    fi

    if [[ -z "${script_output}" ]]; then
        log_error "Empty output from interface ID calculation"
        return 1
    fi

    # Display the interface IDs (truncated to 4 bytes)
    echo ""
    log_info "Interface ID calculation results:"
    echo ""
    echo "${script_output}" | grep -A 1000 "=== SMART Protocol Interface IDs ===" | grep -B 1000 "=== TypeScript Format ===" | sed 's/0x\([0-9a-fA-F]\{8\}\)[0-9a-fA-F]*/0x\1/g'

    # Store script output for later processing
    echo "${script_output}" > "${PROJECT_ROOT}/temp_script_output.txt"
}

# Create output directory and file
create_output_file() {
    log_info "Creating output file..."

    local output_dir_path="${PROJECT_ROOT}/${OUTPUT_DIR}"
    local output_file_path="${output_dir_path}/${OUTPUT_FILE}"

    # Create output directory if it doesn't exist
    if [[ ! -d "${output_dir_path}" ]]; then
        log_info "Creating output directory: ${output_dir_path}"
        if ! mkdir -p "${output_dir_path}"; then
            log_error "Failed to create output directory: ${output_dir_path}"
            return 1
        fi
    fi

    # Check if output file exists and handle force overwrite
    if [[ -f "${output_file_path}" ]] && [[ "${FORCE_OVERWRITE}" != "true" ]]; then
        log_warn "Output file already exists: ${output_file_path}"

        # Check if running in non-interactive environment (CI or non-TTY)
        if [[ -n "${CI:-}" ]] || [[ ! -t 0 ]]; then
            # Non-interactive mode: use default behavior
            if [[ "${FORCE_OVERWRITE_DEFAULT:-false}" == "true" ]]; then
                log_info "Non-interactive mode: auto-overwriting based on FORCE_OVERWRITE_DEFAULT=true"
            else
                log_info "Non-interactive mode: refusing to overwrite (set FORCE_OVERWRITE_DEFAULT=true to auto-overwrite)"
                return 1
            fi
        else
            # Interactive mode: prompt user
            echo -n "Do you want to overwrite it? [y/N]: " >&2
            read -r response
            case "${response}" in
                [yY]|[yY][eE][sS])
                    log_info "User confirmed overwrite"
                    ;;
                *)
                    log_info "Operation cancelled by user"
                    return 1
                    ;;
            esac
        fi
    fi

    # Read script output
    local script_output
    if [[ -f "${PROJECT_ROOT}/temp_script_output.txt" ]]; then
        script_output=$(cat "${PROJECT_ROOT}/temp_script_output.txt")
        rm -f "${PROJECT_ROOT}/temp_script_output.txt"
    else
        log_error "Script output file not found"
        return 1
    fi

    # Extract TypeScript content
    local ts_start_line
    ts_start_line=$(echo "${script_output}" | grep -n "=== TypeScript Format ===" | cut -d: -f1)

    if [[ -z "${ts_start_line}" ]]; then
        log_error "TypeScript format section not found in script output"
        return 1
    fi

    # Extract and process TypeScript content
    local ts_content
    ts_content=$(echo "${script_output}" | tail -n +$((ts_start_line + 1)) | sed '/^$/,$d' | sed 's/0x\([0-9a-fA-F]\{8\}\)[0-9a-fA-F]*/0x\1/g')

    # Create the output file with header
    cat > "${output_file_path}" << EOF
/**
 * ERC165 Interface IDs for SMART Protocol
 *
 * This file is auto-generated by ${SCRIPT_NAME}
 * Do not edit manually - run the script to regenerate
 *
 * Generated on: $(date)
 * Found ${INTERFACES_PROCESSED} interfaces
 */

import { Bytes } from "@graphprotocol/graph-ts";

EOF

    # Append TypeScript content
    echo "${ts_content}" >> "${output_file_path}"

    log_success "Interface IDs saved to: ${output_file_path}"

    # Display TypeScript output for verification
    echo ""
    log_info "Generated TypeScript content:"
    echo "${ts_content}"
}

# Validate the generated output file
validate_output_file() {
    local output_file_path="${PROJECT_ROOT}/${OUTPUT_DIR}/${OUTPUT_FILE}"

    if [[ ! -f "${output_file_path}" ]]; then
        log_error "Output file was not created: ${output_file_path}"
        return 1
    fi

    # Check if file contains expected content
    if ! grep -q "InterfaceIds" "${output_file_path}"; then
        log_error "Output file does not contain expected InterfaceIds class"
        return 1
    fi

    # Check if file contains interface definitions
    local interface_count
    interface_count=$(grep -c "static.*Bytes" "${output_file_path}" || echo "0")

    if [[ ${interface_count} -eq 0 ]]; then
        log_error "Output file does not contain any interface definitions"
        return 1
    fi

    log_success "Output file validation passed (${interface_count} interface definitions found)"
}

# =============================================================================
# MAIN FUNCTION
# =============================================================================

main() {
    log_info "Starting ${SCRIPT_NAME}..."
    log_info "Script directory: ${SCRIPT_DIR}"
    log_info "Project root: ${PROJECT_ROOT}"
    log_info "Output directory: ${OUTPUT_DIR}"
    log_info "Output file: ${OUTPUT_FILE}"

    # Parse command line arguments
    parse_script_arguments "$@"

    # Validate environment
    validate_forge_environment
    validate_commands "forge" "grep" "find" "sed"
    validate_directories "contracts"

    # Find interface files
    find_interface_files

    # Extract interface metadata
    extract_interface_metadata

    # Compile contracts if needed
    compile_contracts

    # Create calculator contract
    create_calculator_contract

    # Calculate interface IDs
    calculate_interface_ids

    # Create output file
    create_output_file

    # Validate output
    validate_output_file

    log_success "Interface ID calculation completed successfully!"
    echo ""
    log_info "Summary:"
    log_info "  - Found and processed ${INTERFACES_PROCESSED} interfaces starting with 'I'"
    log_info "  - Calculated ERC165 interface IDs using Foundry/Forge"
    log_info "  - Results saved to: ${PROJECT_ROOT}/${OUTPUT_DIR}/${OUTPUT_FILE}"
    echo ""
    log_info "Usage:"
    log_info "  - Import the InterfaceIds class in your TypeScript code"
    log_info "  - Use InterfaceIds.INTERFACE_NAME to get the interface ID"
    log_info "  - Example: InterfaceIds.ISMART"
}

# Only run main if script is executed directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
