#!/usr/bin/env bash
set -euo pipefail

# all.sh - Convenience loader for all tool libraries
# This file loads all available library modules for comprehensive functionality

# Prevent multiple sourcing
if [[ "${_ALL_LIBS_LOADED:-}" == "1" ]]; then
    return 0
fi

# Get the library directory
declare LIB_DIR
LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly LIB_DIR

# Source all library modules in dependency order
source "${LIB_DIR}/common.sh"      # Core functionality (must be first)
source "${LIB_DIR}/deps.sh"        # Dependency management
source "${LIB_DIR}/contracts.sh"   # Contract operations
source "${LIB_DIR}/blockchain.sh"  # Blockchain operations
source "${LIB_DIR}/abi.sh"         # ABI processing

# Mark all libraries as loaded
readonly _ALL_LIBS_LOADED=1

log_debug "All tool libraries loaded successfully" 