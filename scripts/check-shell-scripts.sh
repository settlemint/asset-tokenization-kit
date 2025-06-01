#!/usr/bin/env bash
# check-shell-scripts.sh - Run shellcheck on all shell scripts in the project
#
# This script runs shellcheck on all shell scripts in the tools directories
# to ensure they meet our quality standards before committing.
#
# Usage:
#   ./scripts/check-shell-scripts.sh

set -euo pipefail

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly PROJECT_ROOT

echo -e "${YELLOW}Running ShellCheck on all shell scripts...${NC}"

# Check if shellcheck is installed
if ! command -v shellcheck &> /dev/null; then
    echo -e "${RED}Error: shellcheck is not installed${NC}"
    echo "Please install shellcheck:"
    echo "  - macOS: brew install shellcheck"
    echo "  - Ubuntu/Debian: apt-get install shellcheck"
    echo "  - Other: https://github.com/koalaman/shellcheck#installing"
    exit 1
fi

# Initialize counters
total_files=0
failed_files=0

# Function to check scripts in a directory
check_directory() {
    local dir="$1"
    local description="$2"
    
    if [[ ! -d "$dir" ]]; then
        echo -e "${YELLOW}Skipping $description - directory not found: $dir${NC}"
        return
    fi
    
    echo -e "\n${YELLOW}Checking $description...${NC}"
    
    # Find all shell scripts
    while IFS= read -r -d '' script; do
        ((total_files++))
        
        # Get relative path for cleaner output
        local relative_path="${script#$PROJECT_ROOT/}"
        
        # Run shellcheck
        if shellcheck -x -S warning "$script" > /dev/null 2>&1; then
            echo -e "  ${GREEN}✓${NC} $relative_path"
        else
            echo -e "  ${RED}✗${NC} $relative_path"
            ((failed_files++))
            
            # Show the actual errors
            echo -e "${RED}Issues found:${NC}"
            shellcheck -x -S warning "$script" 2>&1 | sed 's/^/    /'
            echo
        fi
    done < <(find "$dir" -name "*.sh" -type f -print0)
}

# Check contracts tools
check_directory "$PROJECT_ROOT/kit/contracts/tools" "contracts tools"

# Check subgraph tools
check_directory "$PROJECT_ROOT/kit/subgraph/tools" "subgraph tools"

# Summary
echo -e "\n${YELLOW}========== Summary ==========${NC}"
echo -e "Total files checked: $total_files"

if [[ $failed_files -eq 0 ]]; then
    echo -e "${GREEN}All shell scripts passed ShellCheck!${NC} ✨"
    exit 0
else
    echo -e "${RED}$failed_files file(s) failed ShellCheck${NC}"
    echo -e "\nPlease fix the issues before committing."
    exit 1
fi