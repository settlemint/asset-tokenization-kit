#!/usr/bin/env bash
# all.sh - Convenience loader for all subgraph tool libraries
#
# This file sources all libraries in the correct order to handle dependencies.
#
# Usage:
#   source "path/to/subgraph/tools/lib/all.sh"

# Get the directory of this script
readonly _ALL_LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source libraries in dependency order
source "${_ALL_LIB_DIR}/common.sh"
source "${_ALL_LIB_DIR}/graph.sh"

# Mark as loaded
readonly _ALL_LIBS_LOADED="true"