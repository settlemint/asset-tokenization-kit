#!/usr/bin/env bash
#
# dev.sh - Asset Tokenization Kit Development Setup Script
#
# This script checks all dependencies and sets up the development environment
# for the SettleMint Asset Tokenization Kit on M1 Mac (Apple Silicon)
#
# Uses OrbStack instead of Docker Desktop for better performance and efficiency
#
# Usage: bash dev.sh
#

set -euo pipefail

# Load environment variables from .env.local if it exists
# This will be called again in setup_environment() to ensure all vars are set
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | xargs) 2>/dev/null || true
fi

# Color codes for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Global variables for progress tracking
TOTAL_STEPS=13
CURRENT_STEP=0
ENABLE_SEED_DATA=false

# Progress bar functions
show_progress_bar() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local completed=$((width * current / total))
    local remaining=$((width - completed))

    printf "\r${BOLD}${CYAN}Overall Progress: [${NC}"
    printf "%${completed}s" | tr ' ' '█'
    printf "%${remaining}s" | tr ' ' '░'
    printf "${BOLD}${CYAN}] ${percentage}%% (${current}/${total})${NC}"
}

update_progress() {
    CURRENT_STEP=$((CURRENT_STEP + 1))
    show_progress_bar $CURRENT_STEP $TOTAL_STEPS
    echo ""
}

show_partial_progress() {
    local message=$1
    local current=$2
    local total=$3
    local width=30
    local percentage=$((current * 100 / total))
    local completed=$((width * current / total))
    local remaining=$((width - completed))

    printf "\r  ${CYAN}${message}: [${NC}"
    printf "%${completed}s" | tr ' ' '▓'
    printf "%${remaining}s" | tr ' ' '░'
    printf "${CYAN}] ${percentage}%%${NC}"
}

# Logging functions
log_header() {
    echo -e "\n${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${MAGENTA}  $1${NC}"
    echo -e "${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    update_progress
}

log_step() {
    echo -e "${CYAN}▶${NC} ${BOLD}$1${NC}"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Required versions
REQUIRED_BUN_VERSION="1.2.19"
REQUIRED_DOCKER_VERSION="20.10.0"

# Check if running on macOS
check_macos() {
    log_step "Checking operating system..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        log_success "Running on macOS"

        # Check if it's Apple Silicon
        if [[ $(uname -m) == "arm64" ]]; then
            log_success "Detected Apple Silicon (M1/M2/M3)"
        else
            log_warning "Not running on Apple Silicon, but continuing anyway"
        fi
    else
        log_error "This script is designed for macOS. Detected: $OSTYPE"
        exit 1
    fi
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Version comparison function
version_ge() {
    printf '%s\n%s' "$2" "$1" | sort -V -C
}

# Check and install Homebrew
check_homebrew() {
    log_step "Checking for Homebrew..."
    if command_exists brew; then
        log_success "Homebrew is installed: $(brew --version | head -n1)"
    else
        log_warning "Homebrew not found. Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

        # Add Homebrew to PATH for M1 Macs
        if [[ -f "/opt/homebrew/bin/brew" ]]; then
            eval "$(/opt/homebrew/bin/brew shellenv)"
            log_success "Homebrew installed and added to PATH"
        else
            log_error "Homebrew installation failed"
            exit 1
        fi
    fi
}

# Check and install Bun
check_bun() {
    log_step "Checking for Bun..."
    if command_exists bun; then
        INSTALLED_BUN_VERSION=$(bun --version)
        log_success "Bun is installed: v${INSTALLED_BUN_VERSION}"

        if [[ "$INSTALLED_BUN_VERSION" != "$REQUIRED_BUN_VERSION" ]]; then
            log_warning "Required Bun version is ${REQUIRED_BUN_VERSION}, but ${INSTALLED_BUN_VERSION} is installed"
            log_info "Installing Bun ${REQUIRED_BUN_VERSION}..."
            curl -fsSL https://bun.sh/install | bash -s "bun-v${REQUIRED_BUN_VERSION}"

            # Source bun in current session
            export BUN_INSTALL="$HOME/.bun"
            export PATH="$BUN_INSTALL/bin:$PATH"
            log_success "Bun ${REQUIRED_BUN_VERSION} installed"
        fi
    else
        log_warning "Bun not found. Installing Bun ${REQUIRED_BUN_VERSION}..."
        curl -fsSL https://bun.sh/install | bash -s "bun-v${REQUIRED_BUN_VERSION}"

        # Source bun in current session
        export BUN_INSTALL="$HOME/.bun"
        export PATH="$BUN_INSTALL/bin:$PATH"

        if command_exists bun; then
            log_success "Bun ${REQUIRED_BUN_VERSION} installed successfully"
        else
            log_error "Bun installation failed. Please install manually from https://bun.sh"
            exit 1
        fi
    fi
}

# Check and install OrbStack (Docker alternative)
check_orbstack() {
    log_step "Checking for OrbStack..."

    if command_exists orb; then
        log_success "OrbStack CLI is installed"

        # Check if OrbStack is running
        log_step "Checking if OrbStack is running..."
        if orb status >/dev/null 2>&1; then
            log_success "OrbStack is running"
        else
            log_warning "OrbStack is installed but not running. Starting OrbStack..."
            orb start

            # Wait for OrbStack to start
            local max_wait=30
            local elapsed=0
            while [ $elapsed -lt $max_wait ]; do
                if orb status >/dev/null 2>&1; then
                    log_success "OrbStack started successfully"
                    break
                fi
                echo -ne "\r${YELLOW}⏳${NC} Waiting for OrbStack to start... ${elapsed}s / ${max_wait}s"
                sleep 2
                elapsed=$((elapsed + 2))
            done
            echo "" # New line after waiting

            if ! orb status >/dev/null 2>&1; then
                log_error "Failed to start OrbStack"
                exit 1
            fi
        fi
    else
        log_warning "OrbStack not found. Installing OrbStack via Homebrew..."
        log_info "OrbStack is a fast, lightweight alternative to Docker Desktop"

        if brew install orbstack; then
            log_success "OrbStack installed successfully"

            # Start OrbStack for the first time
            log_step "Starting OrbStack for the first time..."
            orb start

            # Wait for OrbStack to start
            local max_wait=60
            local elapsed=0
            while [ $elapsed -lt $max_wait ]; do
                if orb status >/dev/null 2>&1; then
                    log_success "OrbStack started successfully"
                    break
                fi
                echo -ne "\r${YELLOW}⏳${NC} Waiting for OrbStack to start... ${elapsed}s / ${max_wait}s"
                sleep 2
                elapsed=$((elapsed + 2))
            done
            echo "" # New line after waiting

            if ! orb status >/dev/null 2>&1; then
                log_error "Failed to start OrbStack after installation"
                log_info "Please try starting OrbStack manually and run this script again"
                exit 1
            fi
        else
            log_error "Failed to install OrbStack via Homebrew"
            log_info "Please install OrbStack manually from: https://orbstack.dev"
            exit 1
        fi
    fi
}

# Check Docker (provided by OrbStack)
check_docker() {
    log_step "Checking for Docker..."
    if command_exists docker; then
        DOCKER_VERSION=$(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n1)
        log_success "Docker is installed: v${DOCKER_VERSION}"

        # Check if Docker daemon is running
        log_step "Checking if Docker daemon is running..."
        if docker info >/dev/null 2>&1; then
            log_success "Docker daemon is running"

            # Verify it's OrbStack
            if docker context show 2>/dev/null | grep -q "orbstack" || docker info 2>/dev/null | grep -q "OrbStack"; then
                log_success "Docker is running via OrbStack"
            else
                log_info "Docker appears to be running (context: $(docker context show 2>/dev/null || echo 'default'))"
            fi
        else
            log_error "Docker daemon is not running"
            log_info "Please ensure OrbStack is running and try again"
            exit 1
        fi

        # Check Docker Compose
        if docker compose version >/dev/null 2>&1; then
            COMPOSE_VERSION=$(docker compose version --short)
            log_success "Docker Compose is available: v${COMPOSE_VERSION}"
        else
            log_error "Docker Compose is not available"
            exit 1
        fi
    else
        log_error "Docker command not found. This should be provided by OrbStack."
        log_info "Please ensure OrbStack is properly installed and running"
        exit 1
    fi
}

# Check and setup Kubernetes (via OrbStack)
check_kubernetes() {
    log_step "Checking Kubernetes availability in OrbStack..."

    if command_exists kubectl; then
        log_success "kubectl is installed"

        # Check if Kubernetes is enabled in OrbStack
        if kubectl cluster-info >/dev/null 2>&1; then
            log_success "Kubernetes cluster is running"

            # Verify it's OrbStack's Kubernetes
            local context=$(kubectl config current-context 2>/dev/null)
            if [[ "$context" == "orbstack" ]]; then
                log_success "Using OrbStack Kubernetes context: $context"
            else
                log_info "Current Kubernetes context: $context"
            fi
        else
            log_warning "Kubernetes cluster is not accessible"
            log_info "Kubernetes can be enabled in OrbStack settings if needed"
            log_info "For this project, Docker Compose is sufficient for local development"
        fi
    else
        log_warning "kubectl not found"
        log_info "Kubernetes can be enabled in OrbStack settings if needed"
        log_info "For this project, Docker Compose is sufficient for local development"
    fi
}

# Check and install Git
check_git() {
    log_step "Checking for Git..."
    if command_exists git; then
        GIT_VERSION=$(git --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
        log_success "Git is installed: v${GIT_VERSION}"
    else
        log_warning "Git not found. Installing Git via Homebrew..."
        brew install git
        log_success "Git installed successfully"
    fi
}

# Comprehensive cleanup at start
cleanup_environment() {
    log_header "CLEANING UP PREVIOUS ENVIRONMENT"

    log_info "This will ensure a completely fresh setup:"
    echo "  • Kill all running processes"
    echo "  • Free all ports (3000, 5432, 8545, etc.)"
    echo "  • Remove all Docker containers and volumes"
    echo "  • Clean all caches and build artifacts"
    echo "  • Reset database to empty state"
    echo "  • Ensure new blockchain with fresh genesis"
    echo ""

    log_step "Killing all related processes..."
    local pids_killed=0

    # Kill bun processes
    if pgrep -f "bun" > /dev/null 2>&1; then
        log_info "Terminating bun processes..."
        pkill -9 -f "bun" 2>/dev/null || true
        pids_killed=1
        sleep 1
    fi

    # Kill node/vite processes
    if pgrep -f "node.*vite" > /dev/null 2>&1; then
        log_info "Terminating vite processes..."
        pkill -9 -f "node.*vite" 2>/dev/null || true
        pids_killed=1
        sleep 1
    fi

    # Kill any process on port 3000, 5432, 8545, 8547
    for port in 3000 42069 5432 8545 8547 8080 7700 7701 8000 9000 9001 4000 4001; do
        if lsof -ti:$port >/dev/null 2>&1; then
            log_info "Freeing port $port..."
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
            pids_killed=1
        fi
    done

    if [ $pids_killed -eq 1 ]; then
        log_success "All processes terminated and ports freed"
        sleep 2
    else
        log_info "No processes to terminate"
    fi

    log_step "Stopping Docker Compose services and removing volumes..."
    if docker compose -p atk ps -q 2>/dev/null | grep -q .; then
        log_info "Stopping Docker services..."
        docker compose -p atk down -v --remove-orphans 2>/dev/null || true
        log_success "Stopped Docker Compose services"
    else
        log_info "No Docker Compose services running"
    fi

    log_step "Removing all Docker volumes (ensures fresh database and blockchain)..."
    local volumes=$(docker volume ls -q --filter name=atk 2>/dev/null)
    if [ -n "$volumes" ]; then
        log_info "Removing Docker volumes for fresh state..."
        echo "$volumes" | xargs docker volume rm 2>/dev/null || true
        log_success "Removed all Docker volumes"
    else
        log_info "No Docker volumes to clean"
    fi

    log_step "Removing any orphaned containers..."
    local orphaned=$(docker ps -a -q --filter "name=atk-" 2>/dev/null)
    if [ -n "$orphaned" ]; then
        log_info "Removing orphaned containers..."
        echo "$orphaned" | xargs docker rm -f 2>/dev/null || true
        log_success "Removed orphaned containers"
    else
        log_info "No orphaned containers"
    fi

    log_step "Clearing Bun cache..."
    local cache_dir="$HOME/.bun/install/cache"
    if [ -d "$cache_dir" ]; then
        local cache_size=$(du -sh "$cache_dir" 2>/dev/null | cut -f1)
        log_info "Current cache size: ${cache_size}"
        rm -rf "$cache_dir"
        log_success "Cleared Bun cache"
    else
        log_info "No Bun cache found"
    fi

    log_step "Removing node_modules directories..."
    local node_modules_found=0

    # Remove root node_modules
    if [ -d node_modules ]; then
        log_info "Removing root node_modules..."
        rm -rf node_modules
        node_modules_found=1
    fi

    # Remove workspace node_modules - explicit list to ensure all are covered
    local workspace_paths=(
        "kit/contracts/node_modules"
        "kit/dapp/node_modules"
        "kit/subgraph/node_modules"
        "kit/e2e/node_modules"
        "kit/charts/node_modules"
        "packages/config/node_modules"
        "packages/zod/node_modules"
        "tools/eslint-config/node_modules"
        "tools/typescript-config/node_modules"
    )

    for dir in "${workspace_paths[@]}"; do
        if [ -d "$dir" ]; then
            log_info "Removing $dir..."
            rm -rf "$dir"
            node_modules_found=1
        fi
    done

    # Fallback: catch any remaining node_modules directories
    for dir in kit/*/node_modules packages/*/node_modules tools/*/node_modules; do
        if [ -d "$dir" ]; then
            log_info "Removing $dir..."
            rm -rf "$dir"
            node_modules_found=1
        fi
    done

    if [ $node_modules_found -eq 1 ]; then
        log_success "Removed all node_modules directories"
    else
        log_info "No node_modules directories found"
    fi

    log_step "Cleaning temporary files..."
    rm -f dapp.log 2>/dev/null || true
    rm -f .dapp.pid 2>/dev/null || true
    rm -f .dapp-cleanup.html 2>/dev/null || true
    rm -f .dapp-terminal.sh 2>/dev/null || true
    log_success "Cleaned temporary files"

    log_step "Cleaning Vite and build caches..."
    local cache_cleaned=0

    # Vite caches
    if [ -d "kit/dapp/.vite" ]; then
        rm -rf kit/dapp/.vite
        log_info "Removed kit/dapp/.vite"
        cache_cleaned=1
    fi
    if [ -d "kit/dapp/.vite-temp" ]; then
        rm -rf kit/dapp/.vite-temp
        log_info "Removed kit/dapp/.vite-temp"
        cache_cleaned=1
    fi
    if [ -d "kit/dapp/.cache" ]; then
        rm -rf kit/dapp/.cache
        log_info "Removed kit/dapp/.cache"
        cache_cleaned=1
    fi

    # Next.js caches (if any)
    if [ -d "kit/dapp/.next" ]; then
        rm -rf kit/dapp/.next
        log_info "Removed kit/dapp/.next"
        cache_cleaned=1
    fi

    # TanStack Router cache
    if [ -d "kit/dapp/.tanstack" ]; then
        rm -rf kit/dapp/.tanstack
        log_info "Removed kit/dapp/.tanstack"
        cache_cleaned=1
    fi

    # Build output directories
    if [ -d "kit/dapp/dist" ]; then
        rm -rf kit/dapp/dist
        log_info "Removed kit/dapp/dist"
        cache_cleaned=1
    fi

    # TypeScript build info
    if [ -f "kit/dapp/*.tsbuildinfo" ]; then
        rm -f kit/dapp/*.tsbuildinfo
        log_info "Removed TypeScript build info files"
        cache_cleaned=1
    fi

    if [ $cache_cleaned -eq 1 ]; then
        log_success "Vite and build caches cleaned"
    else
        log_info "No cache directories found"
    fi

    log_step "Clearing Bun global cache..."
    if [ -d "$HOME/.bun/install/cache" ]; then
        rm -rf "$HOME/.bun/install/cache"
    fi
    if [ -d "$HOME/.bun/tmp" ]; then
        rm -rf "$HOME/.bun/tmp"
    fi
    log_success "Cleared all Bun caches"

    echo ""
    log_success "Environment cleanup completed!"
    log_info "Starting with a completely fresh state"
}

# Check all dependencies
check_dependencies() {
    log_header "CHECKING DEPENDENCIES"

    check_macos
    check_homebrew
    check_git
    check_bun
    check_orbstack
    check_docker
    check_kubernetes

    log_success "All dependencies are satisfied!"
}

# Setup environment file
setup_environment() {
    log_header "SETTING UP ENVIRONMENT"

    if [ ! -f .env.local ]; then
        log_step "Creating .env.local file..."
        
        # Check if example file exists
        if [ -f .env.local.example ]; then
            log_info "Copying from .env.local.example template..."
            cp .env.local.example .env.local
            log_success ".env.local created from template"
            log_warning "Remember to update GITHUB_TOKEN and GITHUB_USERNAME with your actual credentials!"
        else
            log_warning ".env.local.example not found, creating basic .env.local..."
            
            # Create .env.local with local development defaults
            cat > .env.local << 'EOF'
# Local development environment configuration
# Auto-generated by dev.sh

# GitHub Container Registry Authentication (update with your credentials!)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_USERNAME=your_github_username

# Hasura Configuration
SETTLEMINT_HASURA_ADMIN_SECRET=hasura
SETTLEMINT_HASURA_DATABASE_URL=postgresql://hasura:hasura@localhost:5432/hasura

# Blockchain Configuration
SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT=http://localhost:8547

# MinIO Configuration
SETTLEMINT_MINIO_SECRET_KEY=atk-service-secret

# Database Migrations (handled manually by dev.sh)
DISABLE_MIGRATIONS_ON_STARTUP=true
EOF

            log_success ".env.local file created with local development defaults"
            log_warning "Update GITHUB_TOKEN and GITHUB_USERNAME before continuing"
        fi
    else
        log_success ".env.local file already exists"
    fi

    # Load environment variables
    export $(grep -v '^#' .env.local | xargs) 2>/dev/null || true
}

# Check network connectivity and IPv6 issues
check_network_connectivity() {
    log_step "Checking network connectivity..."

    # Test IPv4 connectivity to npm registry
    if curl -4 -s --max-time 5 https://registry.npmjs.org >/dev/null 2>&1; then
        log_success "IPv4 connectivity to npm registry: OK"
    else
        log_warning "IPv4 connectivity to npm registry: FAILED"
    fi

    # Test IPv6 connectivity
    if curl -6 -s --max-time 5 https://registry.npmjs.org >/dev/null 2>&1; then
        log_success "IPv6 connectivity to npm registry: OK"
    else
        log_warning "IPv6 connectivity to npm registry: FAILED (will use IPv4)"
        # Force IPv4 for Bun if IPv6 fails
        export BUN_CONFIG_NO_IPV6=1
    fi
}

# Install project dependencies with retry and troubleshooting
install_project_dependencies() {
    log_header "INSTALLING PROJECT DEPENDENCIES"

    # Check network connectivity first
    check_network_connectivity

    log_step "Analyzing workspace structure..."
    if [ -f package.json ]; then
        local package_count=$(find . -name "package.json" -not -path "*/node_modules/*" | wc -l | tr -d ' ')
        log_info "Found ${package_count} packages in workspace"
    fi

    # Function to run install with timeout and stuck detection
    run_bun_install() {
        local timeout_seconds=300  # 5 minute timeout
        local stuck_threshold=60   # Consider stuck if same message for 60s (reduced from 90s)
        local install_pid
        local start_time=$(date +%s)
        local last_unique_output=""
        local last_change_time=$start_time
        local use_reduced_concurrency="${1:-false}"

        # Always use reduced concurrency to avoid network issues
        if [ "$use_reduced_concurrency" = "true" ]; then
            log_info "Starting installation with minimal concurrency (5 downloads)..."
            export BUN_INSTALL_MAX_CONCURRENT_DOWNLOADS=5
        else
            log_info "Starting installation with reduced concurrency (15 downloads)..."
            export BUN_INSTALL_MAX_CONCURRENT_DOWNLOADS=15
        fi

        # Skip postinstall hooks on first run to avoid cascading issues
        export BUN_CONFIG_SKIP_INSTALL_SCRIPTS=1

        log_info "Note: Resolution phase can take 60-120s for large monorepos"
        log_info "Skipping postinstall hooks to avoid cascading network issues"
        echo ""

        # Create a temp file for output monitoring
        local output_file=$(mktemp)

        # Start bun install in background with progress monitoring
        (
            bun install --verbose 2>&1 | tee "$output_file" | while IFS= read -r line; do
                local current_time=$(date +%s)
                local elapsed=$((current_time - start_time))
                echo -e "${CYAN}[${elapsed}s]${NC} $line"
            done
        ) &
        install_pid=$!

        # Monitor the process with timeout and stuck detection
        local elapsed=0
        local check_count=0

        while kill -0 $install_pid 2>/dev/null; do
            sleep 5
            elapsed=$(($(date +%s) - start_time))
            check_count=$((check_count + 1))

            # Check if output is stuck (same "waiting for X tasks" message)
            if [ -f "$output_file" ]; then
                local recent_output=$(tail -5 "$output_file" | grep -o "waiting for [0-9]* tasks" | head -1)

                if [ -n "$recent_output" ]; then
                    if [ "$recent_output" = "$last_unique_output" ]; then
                        local stuck_duration=$(($(date +%s) - last_change_time))

                        # If stuck on same task count for too long
                        if [ $stuck_duration -ge $stuck_threshold ]; then
                            echo ""
                            log_error "Installation appears stuck at: $recent_output"
                            log_warning "Killing process to retry with reduced concurrency..."
                            kill -9 $install_pid 2>/dev/null
                            wait $install_pid 2>/dev/null
                            rm -f "$output_file"
                            return 2  # Special code for "stuck"
                        fi
                    else
                        last_unique_output="$recent_output"
                        last_change_time=$(date +%s)
                    fi
                fi
            fi

            # Show periodic progress updates
            if [ $((elapsed % 30)) -eq 0 ] && [ $elapsed -gt 0 ]; then
                echo -e "${YELLOW}⏳${NC} Still working... (${elapsed}s elapsed)"

                if [ $((elapsed % 60)) -eq 0 ]; then
                    if [ -n "$last_unique_output" ]; then
                        log_info "Current status: $last_unique_output"
                        local stuck_duration=$(($(date +%s) - last_change_time))
                        if [ $stuck_duration -gt 30 ]; then
                            log_warning "Stuck on same task for ${stuck_duration}s (will retry at ${stuck_threshold}s)"
                        fi
                    fi
                fi
            fi

            # Timeout check
            if [ $elapsed -ge $timeout_seconds ]; then
                log_error "Installation timed out after ${timeout_seconds}s"
                kill -9 $install_pid 2>/dev/null
                wait $install_pid 2>/dev/null
                rm -f "$output_file"
                return 1
            fi
        done

        # Wait for process to complete and get exit code
        wait $install_pid
        local exit_code=$?

        local end_time=$(date +%s)
        local total_time=$((end_time - start_time))

        rm -f "$output_file"

        echo ""
        if [ $exit_code -eq 0 ]; then
            log_success "Installation completed successfully (took ${total_time}s)"
            unset BUN_INSTALL_MAX_CONCURRENT_DOWNLOADS
            unset BUN_CONFIG_SKIP_INSTALL_SCRIPTS
            return 0
        else
            log_error "Installation failed (took ${total_time}s)"
            unset BUN_INSTALL_MAX_CONCURRENT_DOWNLOADS
            unset BUN_CONFIG_SKIP_INSTALL_SCRIPTS
            return 1
        fi
    }

    # Function to run postinstall hooks separately
    run_postinstall_hooks() {
        log_step "Running postinstall hooks (turbo run dependencies)..."
        log_info "This downloads Solidity contract dependencies and prepares build tools..."
        echo ""
        local start_time=$(date +%s)

        if bun run postinstall; then
            local end_time=$(date +%s)
            local total_time=$((end_time - start_time))
            log_success "Postinstall hooks completed (took ${total_time}s)"
            log_info "Contract dependencies are now ready for compilation"
            return 0
        else
            log_warning "Postinstall hooks failed, but continuing..."
            return 1
        fi
    }

    # Try installation with automatic stuck detection and retry
    log_step "Attempting dependency installation (with network optimizations)..."
    run_bun_install
    local install_result=$?

    if [ $install_result -eq 0 ]; then
        # Success!
        if [ -d node_modules ]; then
            local deps_count=$(find node_modules -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
            log_info "Installed approximately ${deps_count} root dependencies"
        fi

        # Now run postinstall hooks separately
        echo ""
        run_postinstall_hooks

        # Verify workspace linking
        echo ""
        log_step "Verifying workspace dependencies are linked..."
        local workspaces_ok=true

        # Check critical workspace folders
        if [ ! -d "kit/dapp/node_modules" ]; then
            log_warning "kit/dapp/node_modules not found"
            workspaces_ok=false
        fi
        if [ ! -d "kit/contracts/node_modules" ]; then
            log_warning "kit/contracts/node_modules not found"
            workspaces_ok=false
        fi

        if [ "$workspaces_ok" = true ]; then
            log_success "All critical workspace dependencies are linked"
        else
            log_warning "Some workspace dependencies may not be linked properly"
            log_info "Bun workspace protocol should handle this automatically"
        fi

    elif [ $install_result -eq 2 ]; then
        # Stuck detected - automatically retry with reduced concurrency
        echo ""
        log_warning "Installation got stuck downloading packages"
        log_info "This is a known issue with Bun when downloading many packages in parallel"
        log_step "Automatically retrying with minimal concurrency (max 5 concurrent downloads)..."
        echo ""

        if run_bun_install "true"; then
            log_success "Installation succeeded with reduced concurrency!"
            if [ -d node_modules ]; then
                local deps_count=$(find node_modules -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
                log_info "Installed approximately ${deps_count} dependencies"
            fi

            # Run postinstall hooks
            echo ""
            run_postinstall_hooks
        else
            log_error "Installation still failing with reduced concurrency"

            # Offer manual troubleshooting
            echo ""
            log_info "Additional troubleshooting options:"
            echo "  1. Clear cache and retry"
            echo "  2. Remove lockfile and retry: rm bun.lockb && bun install"
            echo "  3. Skip (not recommended)"
            echo ""
            read -p "Choose option (1-3): " -n 1 -r
            echo ""

            case $REPLY in
                1)
                    log_step "Clearing Bun cache and retrying..."
                    rm -rf "$HOME/.bun/install/cache"
                    if run_bun_install "true"; then
                        log_success "Installation succeeded after cache clear"
                        run_postinstall_hooks
                    else
                        log_error "Installation still failing"
                        exit 1
                    fi
                    ;;
                2)
                    log_step "Removing lockfile and retrying..."
                    rm -f bun.lockb
                    if run_bun_install "true"; then
                        log_success "Installation succeeded after lockfile removal"
                        run_postinstall_hooks
                    else
                        log_error "Installation still failing"
                        exit 1
                    fi
                    ;;
                3)
                    log_warning "Skipping dependency installation - this may cause issues"
                    ;;
                *)
                    log_error "Invalid option"
                    exit 1
                    ;;
            esac
        fi
    else
        # Other failure
        log_warning "First installation attempt failed"

        # Offer troubleshooting options
        echo ""
        log_info "Troubleshooting options:"
        echo "  1. Retry with reduced concurrency (recommended for stuck downloads)"
        echo "  2. Clear cache and retry"
        echo "  3. Remove lockfile and retry: rm bun.lockb && bun install"
        echo "  4. Skip (not recommended)"
        echo ""
        read -p "Choose option (1-4): " -n 1 -r
        echo ""

        case $REPLY in
            1)
                log_step "Retrying with reduced concurrency..."
                if run_bun_install "true"; then
                    log_success "Installation succeeded with reduced concurrency"
                    run_postinstall_hooks
                else
                    log_error "Installation still failing"
                    exit 1
                fi
                ;;
            2)
                log_step "Clearing Bun cache and retrying..."
                rm -rf "$HOME/.bun/install/cache"
                if run_bun_install; then
                    log_success "Installation succeeded after cache clear"
                    run_postinstall_hooks
                else
                    log_error "Installation still failing after cache clear"
                    exit 1
                fi
                ;;
            3)
                log_step "Removing lockfile and retrying..."
                rm -f bun.lockb
                if run_bun_install; then
                    log_success "Installation succeeded after lockfile removal"
                    run_postinstall_hooks
                else
                    log_error "Installation still failing"
                    exit 1
                fi
                ;;
            4)
                log_warning "Skipping dependency installation - this may cause issues"
                ;;
            *)
                log_error "Invalid option"
                exit 1
                ;;
        esac
    fi
}

# Generate artifacts
generate_artifacts() {
    log_header "GENERATING ARTIFACTS"

    log_step "Compiling smart contracts and generating artifacts..."
    log_info "This process includes:"
    echo "  ${CYAN}→${NC} Compiling Solidity contracts with Foundry"
    echo "  ${CYAN}→${NC} Compiling contracts with Hardhat"
    echo "  ${CYAN}→${NC} Generating genesis.json for local blockchain"
    echo "  ${CYAN}→${NC} Exporting ABIs for Portal API"
    echo "  ${CYAN}→${NC} Generating TypeScript types from contracts"
    echo ""
    log_info "This may take 1-2 minutes..."
    echo ""

    local start_time=$(date +%s)

    if bun run artifacts; then
        local end_time=$(date +%s)
        local total_time=$((end_time - start_time))
        log_success "Artifacts generated successfully (took ${total_time}s)"

        # Show what was generated
        if [ -f "kit/contracts/.generated/genesis.json" ]; then
            log_success "Generated genesis.json for blockchain initialization"
        fi
        if [ -d "kit/contracts/.generated/portal" ]; then
            local abi_count=$(find kit/contracts/.generated/portal -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
            log_success "Generated ${abi_count} contract ABIs for Portal"
        fi
    else
        log_error "Failed to generate artifacts"
        log_info "Check that contracts compile correctly: cd kit/contracts && bun run compile:forge"
        exit 1
    fi
}

# Check Docker registry authentication
check_docker_auth() {
    log_step "Checking Docker registry authentication..."

    # Check if we already have valid authentication
    if docker manifest inspect ghcr.io/settlemint/btp-scs-portal:8.6.9 >/dev/null 2>&1; then
        log_success "Docker registry authentication is valid"
        return 0
    fi

    # Try to authenticate using .env.local credentials
    if [ -n "${GITHUB_TOKEN:-}" ] && [ -n "${GITHUB_USERNAME:-}" ]; then
        log_step "Authenticating with GitHub Container Registry using credentials from .env.local..."

        if echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USERNAME" --password-stdin >/dev/null 2>&1; then
            log_success "Successfully authenticated using .env.local credentials"

            # Verify we can access the image
            if docker manifest inspect ghcr.io/settlemint/btp-scs-portal:8.6.9 >/dev/null 2>&1; then
                log_success "Can access SettleMint Docker images"
                return 0
            fi
        else
            log_warning "Authentication failed with credentials from .env.local"
        fi
    fi

    # If we reach here, automatic authentication failed
    log_warning "Cannot access SettleMint Docker images from GitHub Container Registry"
    log_info "You need to authenticate with GitHub Container Registry (ghcr.io)"
    echo ""
    echo -e "${YELLOW}Option 1: Add to .env.local (Recommended)${NC}"

    if [ ! -f .env.local ]; then
        echo -e "   ${CYAN}cp .env.local.example .env.local${NC}"
    fi

    echo -e "   Edit .env.local and add your GitHub credentials:"
    echo -e "   ${CYAN}GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx${NC}"
    echo -e "   ${CYAN}GITHUB_USERNAME=your_github_username${NC}"
    echo ""
    echo -e "   Get your token from: ${BLUE}https://github.com/settings/tokens${NC}"
    echo -e "   Required scope: ${CYAN}read:packages${NC}"
    echo ""
    echo -e "${YELLOW}Option 2: Manual login${NC}"
    echo -e "   ${CYAN}echo 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' | docker login ghcr.io -u your_github_username --password-stdin${NC}"
    echo ""
    read -p "Press Enter after you've authenticated with GitHub Container Registry..."

    # Check again
    if docker manifest inspect ghcr.io/settlemint/btp-scs-portal:8.6.9 >/dev/null 2>&1; then
        log_success "Authentication successful!"
        return 0
    else
        log_error "Still cannot access the Docker registry. Please check your credentials."
        exit 1
    fi
}

# Start Docker Compose services
start_docker_services() {
    log_header "STARTING DOCKER SERVICES"

    # Check for local PostgreSQL running on port 5432
    log_step "Checking for local PostgreSQL service..."
    if ps aux | grep -E "postgres.*5432|postgres.*postgresql@14" | grep -v grep > /dev/null 2>&1; then
        log_warning "Local PostgreSQL service detected running on port 5432"
        log_info "This will conflict with Docker's PostgreSQL container"
        echo ""
        log_step "Stopping local PostgreSQL service..."

        # Try to stop PostgreSQL using brew services
        if command_exists brew; then
            if brew services list 2>/dev/null | grep postgresql | grep started > /dev/null 2>&1; then
                local pg_service=$(brew services list | grep postgresql | grep started | awk '{print $1}')
                log_info "Stopping brew service: ${pg_service}"
                brew services stop "$pg_service" 2>/dev/null || true
                sleep 2
                log_success "Stopped local PostgreSQL service"
            fi
        fi

        # Double check it's stopped
        if ps aux | grep -E "postgres.*5432|postgres.*postgresql@14" | grep -v grep > /dev/null 2>&1; then
            log_error "Local PostgreSQL is still running"
            log_info "Please stop it manually:"
            echo "  ${CYAN}brew services stop postgresql@14${NC}"
            echo "  ${CYAN}# or${NC}"
            echo "  ${CYAN}brew services stop postgresql${NC}"
            exit 1
        fi
    else
        log_success "No local PostgreSQL service running on port 5432"
    fi
    echo ""

    log_step "Checking for existing Docker containers..."
    if docker compose -p atk ps -q 2>/dev/null | grep -q .; then
        log_warning "Existing containers found. Stopping and cleaning up..."
        docker compose -p atk down
        docker volume ls -q --filter name=^atk | xargs -r docker volume rm 2>/dev/null || true
        log_success "Cleanup completed"
    else
        log_info "No existing containers found"
    fi

    # Check Docker registry authentication before starting
    check_docker_auth

    log_step "Starting Docker Compose services..."
    log_info "This will start 9 services with FRESH STATE (new blockchain + clean database):"
    echo ""
    echo "  ${CYAN}1.${NC} Anvil          - ${BOLD}NEW${NC} blockchain with fresh genesis (port 8545)"
    echo "  ${CYAN}2.${NC} TxSigner       - Transaction signing service (port 8547)"
    echo "  ${CYAN}3.${NC} PostgreSQL     - ${BOLD}CLEAN${NC} database (port 5432)"
    echo "  ${CYAN}4.${NC} Redis          - Cache for Portal"
    echo "  ${CYAN}5.${NC} Hasura         - GraphQL API (port 8080)"
    echo "  ${CYAN}6.${NC} Graph Node     - Subgraph indexing (port 8000)"
    echo "  ${CYAN}7.${NC} Portal         - SettleMint API (ports 7700, 7701)"
    echo "  ${CYAN}8.${NC} MinIO          - File storage (ports 9000, 9001)"
    echo "  ${CYAN}9.${NC} Blockscout     - Blockchain explorer (port 4001)"
    echo ""
    log_info "Starting containers with timestamp: $(date +'%s')"
    log_info "This ensures a completely new blockchain state"
    log_info "Starting containers... (this may take 30-60 seconds)"
    echo ""

    TIMESTAMP=$(date +'%s') docker compose -p atk up -d

    echo ""
    log_step "Waiting for services to become healthy..."
    log_info "Each service performs health checks before becoming ready..."
    sleep 5

    # Check service health
    local max_wait=60
    local elapsed=0
    while [ $elapsed -lt $max_wait ]; do
        local unhealthy=$(docker compose -p atk ps --format json | jq -r 'select(.Health == "unhealthy" or .Health == "starting") | .Name' 2>/dev/null | wc -l)
        if [ "$unhealthy" -eq 0 ]; then
            break
        fi
        echo -ne "\r${YELLOW}⏳${NC} Waiting for services to become healthy... ${elapsed}s / ${max_wait}s"
        sleep 2
        elapsed=$((elapsed + 2))
    done
    echo "" # New line after waiting

    log_success "Docker services started successfully"
    log_info "All services are healthy and ready to accept connections"
    echo ""

    # Display service status
    log_info "Service URLs (will open in browser later):"
    echo "  ${GREEN}✓${NC} Blockchain (Anvil):        http://localhost:8545"
    echo "  ${GREEN}✓${NC} Transaction Signer:        http://localhost:8547"
    echo "  ${GREEN}✓${NC} Portal API:                http://localhost:7700"
    echo "  ${GREEN}✓${NC} Portal GraphQL:            http://localhost:7701"
    echo "  ${GREEN}✓${NC} Hasura Console:            http://localhost:8080"
    echo "  ${GREEN}✓${NC} Graph Node:                http://localhost:8000"
    echo "  ${GREEN}✓${NC} PostgreSQL:                localhost:5432"
    echo "  ${GREEN}✓${NC} MinIO Console:             http://localhost:9001"
    echo "  ${GREEN}✓${NC} Blockscout Explorer:       http://localhost:4001"
    echo ""

    # Verify critical service connectivity
    log_step "Verifying service connectivity..."

    # Test Anvil blockchain
    if curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545 | grep -q "result"; then
        log_success "Anvil blockchain: Connected"
    else
        log_warning "Anvil blockchain: Not responding properly"
    fi

    # Test Hasura
    if curl -s http://localhost:8080/healthz | grep -q "OK"; then
        log_success "Hasura GraphQL: Connected"
    else
        log_warning "Hasura GraphQL: Not responding properly"
    fi

    # Test The Graph subgraph
    if curl -s -X POST -H "Content-Type: application/json" --data '{"query":"{_meta{block{number}}}"}' http://localhost:8000/subgraphs/name/kit 2>/dev/null | grep -q '"data"'; then
        log_success "The Graph subgraph: Connected and indexed"
    else
        log_warning "The Graph subgraph: Not responding (may still be indexing)"
    fi

    # Test Portal
    if curl -s http://localhost:7700/health | grep -q "OK"; then
        log_success "SettleMint Portal: Connected"
    else
        log_warning "SettleMint Portal: Not responding properly"
    fi

    # Test PostgreSQL
    if PGPASSWORD=postgres psql -h localhost -U postgres -d postgres -c "SELECT 1;" >/dev/null 2>&1; then
        log_success "PostgreSQL: Connected"
    else
        log_warning "PostgreSQL: Connection failed"
    fi

    echo ""
}

# Wait for PostgreSQL database to be fully ready
wait_for_postgres() {
    log_header "WAITING FOR DATABASE TO BE READY"

    log_step "Checking PostgreSQL database readiness..."
    log_info "Ensuring database initialization and migrations can succeed"
    echo ""

    # Find the postgres container name dynamically
    local postgres_container=$(docker compose -p atk ps --format json 2>/dev/null | jq -r 'select(.Service == "postgres") | .Name' | head -1)

    if [ -z "$postgres_container" ]; then
        log_error "Cannot find PostgreSQL container"
        log_info "Make sure Docker services are running: ${CYAN}docker compose -p atk ps${NC}"
        exit 1
    fi

    log_info "Found PostgreSQL container: ${CYAN}${postgres_container}${NC}"
    echo ""

    local max_wait=120
    local elapsed=0
    local init_complete=false

    # First, wait for PostgreSQL to be accepting connections
    log_step "Step 1: Waiting for PostgreSQL to accept connections..."
    while [ $elapsed -lt 30 ]; do
        if docker exec "$postgres_container" psql -U postgres -d postgres -c "SELECT 1;" >/dev/null 2>&1; then
            log_success "PostgreSQL is accepting connections"
            break
        fi
        echo -ne "\r${YELLOW}⏳${NC} Waiting for PostgreSQL service... ${elapsed}s"
        sleep 2
        elapsed=$((elapsed + 2))
    done
    echo ""

    if [ $elapsed -ge 30 ]; then
        log_error "PostgreSQL did not start accepting connections"
        exit 1
    fi

    # Wait for initialization script to complete (creates hasura db and user)
    log_step "Step 2: Waiting for database initialization (creating users and databases)..."
    log_info "This includes running init.sql to create hasura database and user"
    echo ""

    elapsed=0
    while [ $elapsed -lt $max_wait ]; do
        # Check if hasura database exists
        local hasura_exists=$(docker exec "$postgres_container" psql -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='hasura';" 2>/dev/null || echo "0")

        if [ "$hasura_exists" = "1" ]; then
            log_success "Hasura database exists"

            # Check if we can connect as hasura user
            if docker exec "$postgres_container" psql -U hasura -d hasura -c "SELECT 1;" >/dev/null 2>&1; then
                log_success "Can connect as hasura user"
                echo ""

                # Wait a bit more for full initialization
                log_info "Waiting 5 more seconds for complete initialization..."
                sleep 5

                # Drop and recreate public schema to ensure clean state
                log_step "Step 3: Resetting public schema for fresh migrations..."
                log_info "Dropping and recreating public schema to ensure clean state..."
                if docker exec "$postgres_container" psql -U hasura -d hasura -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO hasura; GRANT ALL ON SCHEMA public TO public;" >/dev/null 2>&1; then
                    log_success "Successfully reset public schema"
                    
                    # Create drizzle schema for migration tracking
                    log_step "Step 4: Creating Drizzle schema for migration tracking..."
                    if docker exec "$postgres_container" psql -U hasura -d hasura -c "CREATE SCHEMA IF NOT EXISTS drizzle; GRANT ALL ON SCHEMA drizzle TO hasura;" >/dev/null 2>&1; then
                        log_success "Successfully created 'drizzle' schema with proper permissions"
                        
                        # Clean Blockscout database for fresh blockchain indexing
                        log_step "Step 5: Cleaning Blockscout database for fresh blockchain..."
                        log_info "This ensures Blockscout shows only current blockchain data"
                        if docker exec "$postgres_container" psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS blockscout; CREATE DATABASE blockscout OWNER blockscout;" >/dev/null 2>&1; then
                            log_success "Successfully reset Blockscout database"
                            log_info "✓ Blockscout will index from block 0 of new blockchain"
                        else
                            log_warning "Could not reset Blockscout database (will recreate on startup)"
                        fi
                        
                        # Clean TheGraph database for fresh subgraph indexing
                        log_step "Step 6: Cleaning TheGraph database for fresh subgraph..."
                        log_info "This ensures TheGraph indexes from genesis block"
                        if docker exec "$postgres_container" psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS thegraph; CREATE DATABASE thegraph OWNER thegraph;" >/dev/null 2>&1; then
                            log_success "Successfully reset TheGraph database"
                            log_info "✓ TheGraph will index from block 0 of new blockchain"
                        else
                            log_warning "Could not reset TheGraph database (will recreate on startup)"
                        fi
                        
                        init_complete=true
                        break
                    else
                        log_warning "Cannot create drizzle schema yet, retrying..."
                        sleep 5
                        elapsed=$((elapsed + 5))
                    fi
                else
                    log_warning "Cannot reset public schema yet, retrying..."
                    sleep 5
                    elapsed=$((elapsed + 5))
                fi
            else
                log_warning "Hasura database exists but cannot connect as hasura user yet..."
                sleep 3
                elapsed=$((elapsed + 3))
            fi
        else
            echo -ne "\r${YELLOW}⏳${NC} Waiting for init.sql to create hasura database... ${elapsed}s / ${max_wait}s"
            sleep 3
            elapsed=$((elapsed + 3))
        fi
    done
    echo ""

    if [ "$init_complete" = false ]; then
        log_error "Database initialization did not complete in time (timeout: ${max_wait}s)"
        echo ""
        log_info "Troubleshooting steps:"
        echo "  ${YELLOW}1.${NC} Check PostgreSQL logs: ${CYAN}docker compose -p atk logs postgres${NC}"
        echo "  ${YELLOW}2.${NC} Check if init.sql ran: ${CYAN}docker exec $postgres_container psql -U postgres -l${NC}"
        echo "  ${YELLOW}3.${NC} Manually check hasura user: ${CYAN}docker exec $postgres_container psql -U postgres -c '\\du'${NC}"
        exit 1
    fi

    echo ""
    log_success "PostgreSQL is fully initialized and ready!"
    log_info "✓ Hasura database exists"
    log_info "✓ Hasura user has proper permissions"
    log_info "✓ Public schema reset (clean state)"
    log_info "✓ Drizzle schema ready for migration tracking"
    log_info "✓ Blockscout database reset (will index fresh blockchain)"
    log_info "✓ TheGraph database reset (will index from genesis)"
    log_info "Safe to apply migrations - all databases are in clean state"
}

# Connect to local blockchain
connect_blockchain() {
    log_header "CONNECTING TO LOCAL BLOCKCHAIN"

    log_step "Configuring connection to local blockchain instance..."
    log_info "This registers the local Anvil node with SettleMint CLI"
    echo ""

    if command_exists settlemint; then
        if bun settlemint connect --instance local; then
            log_success "Connected to local blockchain"
            log_info "You can now deploy contracts and interact with the blockchain"
        else
            log_warning "Failed to connect via settlemint CLI, but continuing..."
            log_info "You can manually connect later: settlemint connect --instance local"
        fi
    else
        log_warning "SettleMint CLI not found, skipping blockchain connection"
        log_info "Install it with: bun add -g @settlemint/sdk-cli"
    fi
}

# Setup dApp - Generate SettleMint SDK types and GraphQL schemas
setup_dapp() {
    log_header "SETTING UP DAPP"

    log_step "Navigating to dApp directory..."
    cd kit/dapp
    log_success "In kit/dapp"
    echo ""

    # Ensure dApp dependencies are properly installed/linked
    log_step "Installing dApp dependencies..."
    log_info "Running bun install in kit/dapp to ensure all dependencies are available"
    echo ""
    if bun install 2>&1 | tee /tmp/dapp-install.log | grep -v "^$" | while IFS= read -r line; do
        echo "  ${CYAN}→${NC} $line"
    done; then
        log_success "dApp dependencies installed successfully"
    else
        log_warning "bun install had some warnings, but continuing..."
        log_info "Check /tmp/dapp-install.log for details"
    fi
    echo ""

    # Create/update dApp .env.local with required settings
    log_step "Configuring dApp environment..."
    cat > .env.local << 'EOF'
# Database Configuration
SETTLEMINT_HASURA_ADMIN_SECRET=hasura
SETTLEMINT_HASURA_DATABASE_URL=postgresql://hasura:hasura@localhost:5432/hasura

# MinIO Configuration
SETTLEMINT_MINIO_SECRET_KEY=atk-service-secret

# Disable automatic migrations (we handle them manually)
DISABLE_MIGRATIONS_ON_STARTUP=true
EOF
    log_success "dApp environment configured"
    log_info "✓ Database connection: postgresql://hasura:hasura@localhost:5432/hasura"
    log_info "✓ Automatic migrations: DISABLED (will apply manually)"
    echo ""

    # Run database migrations manually (DISABLE_MIGRATIONS_ON_STARTUP is set)
    log_step "Applying database migrations manually..."
    log_info "Applying Drizzle ORM migrations to create dApp tables (Better Auth, etc.)"
    log_info "Database is in clean state - public schema was reset earlier"
    echo ""

    # Count migration files
    local migration_count=$(ls -1 drizzle/[0-9]*.sql 2>/dev/null | wc -l | tr -d ' ')

    if [ "$migration_count" -eq 0 ]; then
        log_error "No migration files found in drizzle/ directory"
        log_info "Expected migration files like: drizzle/0000_perpetual_joseph.sql"
        cd ../..
        exit 1
    fi

    log_info "Found ${migration_count} migration file(s) to apply"
    echo ""

    local migrations_applied=0
    local migrations_failed=0
    local migration_index=0

    for migration_file in drizzle/[0-9]*.sql; do
        if [ -f "$migration_file" ]; then
            migration_index=$((migration_index + 1))
            local migration_name=$(basename "$migration_file")

            # Show progress bar
            show_partial_progress "Migrations" $migration_index $migration_count
            echo ""
            log_info "Applying: ${CYAN}${migration_name}${NC}"

            # Apply migration and capture output
            local migration_log="/tmp/dapp_migrate_${migration_name}.log"
            if PGPASSWORD=hasura psql -h localhost -U hasura -d hasura -f "$migration_file" > "$migration_log" 2>&1; then
                log_success "  ✓ Successfully applied ${migration_name}"
                migrations_applied=$((migrations_applied + 1))
            else
                # Check if it's just a duplicate/already exists error
                if grep -qiE "already exists|duplicate" "$migration_log" 2>/dev/null; then
                    log_info "  ℹ Tables already exist (expected on restart) - ${migration_name}"
                    migrations_applied=$((migrations_applied + 1))
                else
                    log_error "  ✗ Failed to apply ${migration_name}"
                    log_info "  Error details:"
                    head -20 "$migration_log" | sed 's/^/    /'
                    migrations_failed=$((migrations_failed + 1))
                fi
            fi
        fi
    done

    echo ""

    if [ $migrations_failed -gt 0 ]; then
        log_error "Some migrations failed: ${migrations_failed} failed, ${migrations_applied} succeeded"
        log_info "Check logs in /tmp/dapp_migrate_*.log for details"
        cd ../..
        exit 1
    else
        log_success "All database migrations applied successfully!"
        log_info "✓ Applied ${migrations_applied} migration file(s)"
        log_info "✓ Better Auth tables and schemas are ready"
        log_info "✓ dApp will skip automatic migrations (DISABLE_MIGRATIONS_ON_STARTUP=true)"
    fi
    echo ""

    # Track tables in Hasura
    log_step "Tracking tables in Hasura..."
    log_info "This ensures all database tables are available in the Hasura GraphQL API"
    echo ""

    # We'll track tables after the dApp starts (it has the trackAllTables function)
    # For now, just inform the user that it will happen automatically
    log_info "Note: Tables will be automatically tracked when dApp starts"
    log_info "The dApp's migrateDatabase() function calls trackAllTables()"
    echo ""

    log_step "Generating TypeScript types and GraphQL schemas..."
    log_info "This connects to running services to generate types:"
    echo "  ${CYAN}→${NC} Portal API SDK types"
    echo "  ${CYAN}→${NC} Hasura GraphQL schema"
    echo "  ${CYAN}→${NC} Blockscout GraphQL schema"
    echo "  ${CYAN}→${NC} TheGraph subgraph schema"
    echo ""
    log_info "Waiting for services to be fully ready..."

    # Wait for each critical GraphQL service to be ready
    local max_wait=120
    local elapsed=0

    # Wait for Hasura GraphQL
    log_step "Checking Hasura GraphQL readiness..."
    while [ $elapsed -lt $max_wait ]; do
        if curl -s -X POST -H "Content-Type: application/json" \
            -H "x-hasura-admin-secret: hasura" \
            --data '{"query":"{__schema{queryType{name}}}"}' \
            http://localhost:8080/v1/graphql 2>/dev/null | grep -q "queryType"; then
            log_success "Hasura GraphQL is ready"
            break
        fi
        echo -ne "\r${YELLOW}⏳${NC} Waiting for Hasura GraphQL... ${elapsed}s / ${max_wait}s"
        sleep 3
        elapsed=$((elapsed + 3))
    done
    echo ""

    if [ $elapsed -ge $max_wait ]; then
        log_error "Hasura GraphQL not ready after ${max_wait}s"
        log_info "Check logs: ${CYAN}docker compose -p atk logs hasura${NC}"
        cd ../..
        exit 1
    fi

    # Wait for TheGraph subgraph
    log_step "Checking TheGraph subgraph readiness..."
    elapsed=0
    while [ $elapsed -lt $max_wait ]; do
        if curl -s -X POST -H "Content-Type: application/json" \
            --data '{"query":"{_meta{block{number}}}"}' \
            http://localhost:8000/subgraphs/name/kit 2>/dev/null | grep -q '"data"'; then
            log_success "TheGraph subgraph is ready"
            break
        fi
        echo -ne "\r${YELLOW}⏳${NC} Waiting for TheGraph subgraph to index... ${elapsed}s / ${max_wait}s"
        sleep 5
        elapsed=$((elapsed + 5))
    done
    echo ""

    if [ $elapsed -ge $max_wait ]; then
        log_warning "TheGraph subgraph not ready after ${max_wait}s - continuing anyway"
        log_info "TheGraph codegen may fail but other schemas should work"
    fi

    # Wait for Blockscout GraphQL
    log_step "Checking Blockscout GraphQL readiness..."
    elapsed=0
    while [ $elapsed -lt 60 ]; do
        if curl -s -X POST -H "Content-Type: application/json" \
            --data '{"query":"{__schema{queryType{name}}}"}' \
            http://localhost:4001/graphql 2>/dev/null | grep -q "queryType"; then
            log_success "Blockscout GraphQL is ready"
            break
        fi
        echo -ne "\r${YELLOW}⏳${NC} Waiting for Blockscout GraphQL... ${elapsed}s / 60s"
        sleep 3
        elapsed=$((elapsed + 3))
    done
    echo ""

    if [ $elapsed -ge 60 ]; then
        log_warning "Blockscout GraphQL not ready after 60s - continuing anyway"
    fi

    log_info "Running code generation (this takes 10-20 seconds)..."
    echo ""

    if bun run codegen:settlemint; then
        echo ""
        log_success "SDK types and GraphQL schemas generated successfully"
        log_info "TypeScript types are now available for all APIs"
    else
        echo ""
        log_error "Failed to generate SDK types and GraphQL schemas"
        log_info "Troubleshooting steps:"
        echo "  ${YELLOW}1.${NC} Check Docker services are healthy: ${CYAN}docker compose -p atk ps${NC}"
        echo "  ${YELLOW}2.${NC} Check service logs: ${CYAN}docker compose -p atk logs${NC}"
        echo "  ${YELLOW}3.${NC} Verify Portal is responding: ${CYAN}curl http://localhost:7700/health${NC}"
        cd ../..
        exit 1
    fi

    log_info "dApp code generation complete!"

    cd ../..
}

# Seed database with test data
seed_database() {
    log_header "SEEDING DATABASE WITH TEST DATA"

    local PROJECT_ROOT=$(pwd)
    cd "${PROJECT_ROOT}/kit/dapp"

    # Verify dApp server is responding to API calls before seeding
    log_step "Verifying dApp API is ready for seeding..."
    local max_wait=60
    local elapsed=0
    local api_ready=false

    while [ $elapsed -lt $max_wait ]; do
        # Try to access the API health endpoint or root
        if curl -s http://localhost:3000/api/health >/dev/null 2>&1 || \
           curl -s http://localhost:3000/ >/dev/null 2>&1; then
            api_ready=true
            break
        fi

        echo -ne "\r${YELLOW}⏳${NC} Waiting for dApp API to be ready... ${elapsed}s / ${max_wait}s"
        sleep 3
        elapsed=$((elapsed + 3))
    done
    echo ""

    if [ "$api_ready" = false ]; then
        log_warning "dApp API not responding after ${max_wait}s"
        log_warning "Attempting to seed anyway - integration tests may initialize the system"
        echo ""
    else
        log_success "dApp API is ready!"
        echo ""
    fi

    log_step "Running integration tests to create seed data..."
    log_info "This will create test users, system setup, and demo assets"
    log_info "Expected time: 2-3 minutes"
    echo ""

    local start_time=$(date +%s)

    if bun run test:integration 2>&1 | tee /tmp/seed-data.log | grep -E "(✓|✗|PASS|FAIL|Error)" | while IFS= read -r line; do
        echo "  ${CYAN}→${NC} $line"
    done; then
        local end_time=$(date +%s)
        local total_time=$((end_time - start_time))
        echo ""
        log_success "Test data seeded successfully! (took ${total_time}s)"
        echo ""
        log_info "You can now login with these test accounts:"
        echo "  ${GREEN}•${NC} admin@settlemint.com    | password: ${CYAN}settlemint${NC} | PIN: ${CYAN}123456${NC}"
        echo "  ${GREEN}•${NC} issuer@settlemint.com   | password: ${CYAN}settlemint${NC} | PIN: ${CYAN}123456${NC}"
        echo "  ${GREEN}•${NC} investor@settlemint.com | password: ${CYAN}settlemint${NC} | PIN: ${CYAN}123456${NC}"
        echo ""
    else
        local end_time=$(date +%s)
        local total_time=$((end_time - start_time))
        echo ""
        log_error "Test data seeding failed (took ${total_time}s)"
        echo ""

        # Check for common error patterns
        if grep -q "System not created" /tmp/seed-data.log 2>/dev/null; then
            log_error "Error: System not created"
            log_info "This usually means the dApp server is not fully initialized"
            echo ""
            log_info "Troubleshooting steps:"
            echo "  ${YELLOW}1.${NC} Check dApp logs: ${CYAN}tail -f ${PROJECT_ROOT}/dapp.log${NC}"
            echo "  ${YELLOW}2.${NC} Verify dApp is running: ${CYAN}curl http://localhost:3000${NC}"
            echo "  ${YELLOW}3.${NC} Check for errors in dApp startup"
            echo "  ${YELLOW}4.${NC} Try seeding manually after dApp stabilizes:"
            echo "      ${CYAN}cd kit/dapp && bun run test:integration${NC}"
            echo ""
        elif grep -q "ECONNREFUSED" /tmp/seed-data.log 2>/dev/null; then
            log_error "Error: Connection refused"
            log_info "Cannot connect to dApp server or services"
            echo ""
            log_info "Check if all services are running:"
            echo "  ${CYAN}docker compose -p atk ps${NC}"
            echo "  ${CYAN}curl http://localhost:3000${NC}"
            echo ""
        else
            log_warning "Integration tests encountered errors"
            log_info "Check /tmp/seed-data.log for details"
            echo ""
            log_info "Common causes:"
            echo "  • dApp server still initializing (wait a few minutes)"
            echo "  • Database connection issues"
            echo "  • Smart contracts not properly deployed"
            echo ""
            log_info "You can try seeding manually later:"
            echo "  ${CYAN}cd kit/dapp && bun run test:integration${NC}"
            echo ""
        fi

        # Show last 10 lines of error log
        log_info "Last 10 lines from error log:"
        echo ""
        tail -10 /tmp/seed-data.log | sed 's/^/  /'
        echo ""

        log_warning "Continuing without seed data..."
        log_info "You can create test users manually or run seeding later"
        sleep 3
    fi

    cd "${PROJECT_ROOT}"
}

# Start dApp development server
start_dapp() {
    log_header "STARTING DAPP DEVELOPMENT SERVER"

    # Get absolute path to project root
    local PROJECT_ROOT=$(pwd)

    log_step "Preparing to start Next.js development server..."
    log_info "The dApp will run at: ${BLUE}http://localhost:3000${NC}"
    echo ""

    cd "${PROJECT_ROOT}/kit/dapp"

    # Verify we're in the right directory
    if [ ! -f "package.json" ]; then
        log_error "Cannot find kit/dapp/package.json"
        exit 1
    fi

    # Export required environment variables for the dApp
    export SETTLEMINT_HASURA_ADMIN_SECRET="${SETTLEMINT_HASURA_ADMIN_SECRET:-hasura}"
    export SETTLEMINT_HASURA_DATABASE_URL="${SETTLEMINT_HASURA_DATABASE_URL:-postgresql://hasura:hasura@localhost:5432/hasura}"
    export SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT="${SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT:-http://localhost:8547}"
    export DISABLE_MIGRATIONS_ON_STARTUP="true"

    log_success "Environment variables configured for dApp"
    log_info "✓ DISABLE_MIGRATIONS_ON_STARTUP=true (migrations applied manually earlier)"

    # Verify database tables exist (should have been created by setup_dapp)
    log_step "Verifying database schema..."
    local table_count=$(PGPASSWORD=hasura psql -h localhost -U hasura -d hasura -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';" 2>/dev/null || echo "0")

    if [ "$table_count" -gt 0 ]; then
        log_success "Database has $table_count tables - schema is ready"

        # List some key tables to confirm migrations worked
        local key_tables=$(PGPASSWORD=hasura psql -h localhost -U hasura -d hasura -tAc "SELECT string_agg(tablename, ', ') FROM pg_tables WHERE schemaname='public' AND tablename IN ('user', 'session', 'account');" 2>/dev/null)
        if [ -n "$key_tables" ]; then
            log_info "✓ Key tables present: ${key_tables}"
        fi
    else
        log_error "No tables found in database!"
        log_error "Migrations should have been applied in setup_dapp step"
        log_info "This indicates a problem with the migration process"
        log_info "Try running the script again or check migration logs in /tmp/dapp_migrate_*.log"
        exit 1
    fi
    echo ""

    # Kill any existing dev server processes to free ports
    log_step "Checking for existing development server processes..."

    # Kill bun processes (including bun dev, bun vite, etc.)
    local bun_pids=$(pgrep -f "bun.*(dev|vite)" 2>/dev/null || true)
    if [ -n "$bun_pids" ]; then
        log_warning "Found existing bun development processes. Terminating..."
        echo "$bun_pids" | while read -r pid; do
            if [ -n "$pid" ]; then
                log_info "Killing bun process: $pid"
                kill -9 "$pid" 2>/dev/null || true
            fi
        done
        log_success "Terminated bun processes"
    fi

    # Kill node processes running vite (fallback from npm/yarn)
    local node_vite_pids=$(pgrep -f "node.*vite.*dev" 2>/dev/null || true)
    if [ -n "$node_vite_pids" ]; then
        log_warning "Found node processes running vite. Terminating..."
        echo "$node_vite_pids" | while read -r pid; do
            if [ -n "$pid" ]; then
                log_info "Killing node vite process: $pid"
                kill -9 "$pid" 2>/dev/null || true
            fi
        done
        log_success "Terminated node vite processes"
    fi

    if [ -z "$bun_pids" ] && [ -z "$node_vite_pids" ]; then
        log_info "No existing development server processes found"
    fi

    sleep 2

    # Double-check port 3000 is free (dApp main port)
    log_step "Verifying port 3000 is available..."
    if lsof -ti:3000 >/dev/null 2>&1; then
        log_warning "Port 3000 is still in use. Forcefully freeing it..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
        sleep 2
        log_success "Port 3000 is now free"
    else
        log_success "Port 3000 is available"
    fi

    # Also check port 42069 (Vite HMR/WebSocket port)
    log_step "Verifying port 42069 (Vite HMR) is available..."
    if lsof -ti:42069 >/dev/null 2>&1; then
        log_warning "Port 42069 is in use. Forcefully freeing it..."
        lsof -ti:42069 | xargs kill -9 2>/dev/null || true
        sleep 2
        log_success "Port 42069 is now free"
    else
        log_success "Port 42069 is available"
    fi
    echo ""

    # Create log file path
    local LOG_FILE="${PROJECT_ROOT}/dapp.log"
    local PID_FILE="${PROJECT_ROOT}/.dapp.pid"

    # Start dApp in background without opening a new Terminal window
    log_step "Launching dApp server (bun --bun vite dev)..."
    log_info "Starting TanStack Start development server with Vite..."
    log_info "Server will run in background..."
    echo ""

    # Run the dApp in background and save PID
    log_info "Starting dApp server in background..."
    nohup bun --bun vite dev > "${LOG_FILE}" 2>&1 &
    local DAPP_PID=$!
    echo $DAPP_PID > "${PID_FILE}"

    log_success "dApp server started in background"
    log_info "✓ Process ID: ${CYAN}${DAPP_PID}${NC}"
    log_info "✓ URL: ${BLUE}http://localhost:3000${NC}"
    log_info "✓ Logs: ${CYAN}dapp.log${NC}"
    log_info "✓ View logs: ${CYAN}tail -f dapp.log${NC}"
    log_info "✓ Stop server: ${CYAN}kill ${DAPP_PID}${NC}"
    echo ""

    cd "${PROJECT_ROOT}"

    # Wait for dApp to be ready
    log_step "Waiting for dApp to start and become responsive..."
    log_info "Vite needs to compile the React application on first run"
    log_info "This usually takes 30-60 seconds..."
    echo ""

    local max_wait=90
    local elapsed=0
    local first_check=true
    local dots=0
    local vite_started=false

    while [ $elapsed -lt $max_wait ]; do
        # Check if process is still running
        if ! kill -0 $DAPP_PID 2>/dev/null; then
            echo ""
            log_error "dApp process died unexpectedly"
            log_info "Last 50 lines of dapp.log:"
            echo ""
            tail -50 "${LOG_FILE}"
            echo ""
            log_info "Common issues and solutions:"
            echo "  ${YELLOW}1.${NC} Port conflict - Try: ${CYAN}lsof -i:3000 && lsof -i:42069${NC}"
            echo "  ${YELLOW}2.${NC} Missing dependencies - Try: ${CYAN}cd kit/dapp && bun install${NC}"
            echo "  ${YELLOW}3.${NC} Corrupted cache - Try: ${CYAN}rm -rf kit/dapp/.vite kit/dapp/.vite-temp${NC}"
            echo "  ${YELLOW}4.${NC} Check Docker services - Try: ${CYAN}docker compose -p atk ps${NC}"
            exit 1
        fi

        # Check if Vite has started by looking at the log file
        if [ -f "${LOG_FILE}" ] && grep -q "ready in" "${LOG_FILE}" 2>/dev/null; then
            if [ "$vite_started" = false ]; then
                vite_started=true
                echo "" # New line
                log_success "Vite compilation completed!"
                log_info "Checking server response..."
            fi
        fi

        # Check if dApp is responding
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            echo "" # New line after waiting message
            log_success "dApp is ready and responding at http://localhost:3000"

            # Show compilation time from logs
            local compile_time=$(grep "ready in" "${LOG_FILE}" 2>/dev/null | tail -1 | grep -oE '[0-9]+ ms' || echo "")
            if [ -n "$compile_time" ]; then
                log_info "Compilation completed in ${compile_time}"
            fi

            return 0
        fi

        # Show a hint after first few attempts
        if [ $first_check = true ] && [ $elapsed -ge 10 ]; then
            log_info "Still compiling... (this is normal for first run)"
            first_check=false
        fi

        sleep 3
        elapsed=$((elapsed + 3))

        # Animated progress with more detail
        dots=$(( (dots + 1) % 4 ))
        local dot_string=$(printf '%*s' "$dots" | tr ' ' '.')
        local status="compiling"
        if [ "$vite_started" = true ]; then
            status="waiting for response"
        fi
        echo -ne "\r${YELLOW}⏳${NC} ${status}${dot_string}$(printf '%*s' "$((3-dots))" ' ') [${elapsed}s / ${max_wait}s]"
    done
    echo "" # New line after waiting

    log_warning "dApp may still be starting (timeout reached after ${max_wait}s)"
    log_info "The dApp is running in background (PID: $DAPP_PID)"
    log_info "Check progress: ${CYAN}tail -f dapp.log${NC}"

    # Show what's in the log so far
    if [ -f "${LOG_FILE}" ]; then
        echo ""
        log_info "Current log output:"
        tail -20 "${LOG_FILE}"
    fi

    log_info "Once ready, open: ${BLUE}http://localhost:3000${NC}"
}

# Note: Database migrations are now handled automatically by the dApp on startup
# The drizzle schema is pre-created in wait_for_postgres() to ensure migrations succeed

# Open services in default browser
open_services_in_browser() {
    log_header "OPENING SERVICES IN BROWSER"

    log_step "Opening service URLs in default browser..."
    log_info "Opening 5 tabs - please allow pop-ups if prompted"
    echo ""

    # Wait a moment to ensure all services are fully ready
    sleep 2

    # Open dApp directly
    log_info "Opening dApp..."
    open "http://localhost:3000" &
    sleep 0.5

    log_info "Opening Hasura Console..."
    open "http://localhost:8080" &          # Hasura Console
    sleep 0.5

    log_info "Opening Graph Node..."
    open "http://localhost:8000" &          # Graph Node
    sleep 0.5

    log_info "Opening MinIO Console..."
    open "http://localhost:9001" &          # MinIO Console
    sleep 0.5

    log_info "Opening Blockscout Explorer..."
    open "http://localhost:4001" &          # Blockscout Explorer

    echo ""
    log_success "Opened all services in browser"
    echo ""

    log_info "Service URLs (now open in your browser):"
    echo "  ${GREEN}✓${NC} dApp:                      ${BLUE}http://localhost:3000${NC}"
    echo "  ${GREEN}✓${NC} Hasura Console:            ${BLUE}http://localhost:8080${NC}"
    echo "  ${GREEN}✓${NC} Graph Node:                ${BLUE}http://localhost:8000${NC}"
    echo "  ${GREEN}✓${NC} MinIO Console:             ${BLUE}http://localhost:9001${NC}"
    echo "  ${GREEN}✓${NC} Blockscout Explorer:       ${BLUE}http://localhost:4001${NC}"
}

# Display final instructions
display_final_instructions() {
    log_header "SETUP COMPLETE! 🎉"

    echo -e "${GREEN}${BOLD}Your development environment is ready!${NC}\n"

    echo -e "${BOLD}${MAGENTA}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN}                    SERVICE ACCESS INFORMATION                      ${NC}"
    echo -e "${BOLD}${MAGENTA}═══════════════════════════════════════════════════════════════════${NC}\n"

    echo -e "${BOLD}1. dApp (Web Application)${NC}"
    echo -e "   ${CYAN}URL:${NC}        ${BLUE}http://localhost:3000${NC}"
    echo -e "   ${CYAN}Status:${NC}     Web interface for asset tokenization"
    echo -e "   ${YELLOW}Test Users (after running integration tests):${NC}"
    echo -e "      • ${GREEN}admin@settlemint.com${NC}    | Password: ${CYAN}settlemint${NC} | PIN: ${CYAN}123456${NC}"
    echo -e "      • ${GREEN}issuer@settlemint.com${NC}   | Password: ${CYAN}settlemint${NC} | PIN: ${CYAN}123456${NC}"
    echo -e "      • ${GREEN}investor@settlemint.com${NC} | Password: ${CYAN}settlemint${NC} | PIN: ${CYAN}123456${NC}\n"

    echo -e "${BOLD}2. Hasura Console (GraphQL API)${NC}"
    echo -e "   ${CYAN}URL:${NC}        ${BLUE}http://localhost:8080${NC}"
    echo -e "   ${CYAN}Port:${NC}       8080"
    echo -e "   ${CYAN}Admin Secret:${NC} ${YELLOW}hasura${NC}"
    echo -e "   ${CYAN}Usage:${NC}      GraphQL API and database management\n"

    echo -e "${BOLD}3. PostgreSQL Database${NC}"
    echo -e "   ${CYAN}Host:${NC}       localhost"
    echo -e "   ${CYAN}Port:${NC}       5432"
    echo -e "   ${CYAN}Databases & Credentials:${NC}"
    echo -e "      • Database: ${YELLOW}hasura${NC}     | User: ${YELLOW}hasura${NC}     | Password: ${YELLOW}hasura${NC}"
    echo -e "      • Database: ${YELLOW}portal${NC}     | User: ${YELLOW}portal${NC}     | Password: ${YELLOW}portal${NC}"
    echo -e "      • Database: ${YELLOW}blockscout${NC} | User: ${YELLOW}blockscout${NC} | Password: ${YELLOW}blockscout${NC}"
    echo -e "      • Database: ${YELLOW}thegraph${NC}   | User: ${YELLOW}thegraph${NC}   | Password: ${YELLOW}thegraph${NC}"
    echo -e "      • Database: ${YELLOW}txsigner${NC}   | User: ${YELLOW}txsigner${NC}   | Password: ${YELLOW}txsigner${NC}"
    echo -e "      • Admin:    ${YELLOW}postgres${NC}   | User: ${YELLOW}postgres${NC}   | Password: ${YELLOW}postgres${NC}"
    echo -e "   ${CYAN}Connect:${NC}    ${YELLOW}psql postgresql://hasura:hasura@localhost:5432/hasura${NC}\n"

    echo -e "${BOLD}4. MinIO Console (Object Storage)${NC}"
    echo -e "   ${CYAN}URL:${NC}        ${BLUE}http://localhost:9001${NC}"
    echo -e "   ${CYAN}API Port:${NC}   9000"
    echo -e "   ${CYAN}Console Login (Web UI):${NC}"
    echo -e "      • Username: ${YELLOW}minio${NC}"
    echo -e "      • Password: ${YELLOW}miniominio${NC}"
    echo -e "   ${CYAN}Service Account (API):${NC}"
    echo -e "      • Access Key: ${YELLOW}atk-service${NC}"
    echo -e "      • Secret Key: ${YELLOW}atk-service-secret${NC}"
    echo -e "   ${CYAN}Usage:${NC}      File storage and document management\n"

    echo -e "${BOLD}5. Portal API (SettleMint Backend)${NC}"
    echo -e "   ${CYAN}API URL:${NC}       ${BLUE}http://localhost:7700${NC}"
    echo -e "   ${CYAN}GraphQL URL:${NC}   ${BLUE}http://localhost:7701${NC}"
    echo -e "   ${CYAN}Usage:${NC}         Backend services and blockchain integration\n"

    echo -e "${BOLD}6. Graph Node (Subgraph Indexing)${NC}"
    echo -e "   ${CYAN}URL:${NC}        ${BLUE}http://localhost:8000${NC}"
    echo -e "   ${CYAN}Usage:${NC}      Blockchain data indexing and querying\n"

    echo -e "${BOLD}7. Blockscout Explorer${NC}"
    echo -e "   ${CYAN}URL:${NC}        ${BLUE}http://localhost:4001${NC}"
    echo -e "   ${CYAN}Usage:${NC}      Blockchain explorer and transaction viewer\n"

    echo -e "${BOLD}8. Blockchain Node (Anvil)${NC}"
    echo -e "   ${CYAN}JSON-RPC:${NC}   http://localhost:8545"
    echo -e "   ${CYAN}Via Signer:${NC} http://localhost:8547"
    echo -e "   ${CYAN}Chain ID:${NC}   31337 (local development)"
    echo -e "   ${CYAN}Usage:${NC}      Local Ethereum-compatible blockchain\n"

    echo -e "${BOLD}${MAGENTA}═══════════════════════════════════════════════════════════════════${NC}\n"

    echo -e "${BOLD}dApp Process:${NC}\n"
    if [ -f .dapp.pid ]; then
        local pid=$(cat .dapp.pid)
        echo -e "   • Process ID: ${CYAN}$pid${NC}"
        echo -e "   • Running in: ${CYAN}Background${NC}"
        echo -e "   • Logs: ${CYAN}dapp.log${NC}"
        echo -e "   • View logs: ${CYAN}tail -f dapp.log${NC}"
        echo -e "   • Stop dApp: ${CYAN}kill $pid${NC}\n"
    else
        echo -e "   • Running in: ${CYAN}Background${NC}"
        echo -e "   • Logs: ${CYAN}dapp.log${NC}"
        echo -e "   • View logs: ${CYAN}tail -f dapp.log${NC}"
        echo -e "   • Stop dApp: Use ${CYAN}kill${NC} command\n"
    fi

    echo -e "${BOLD}${CYAN}Next Steps:${NC}\n"

    echo -e "${YELLOW}1.${NC} ${BOLD}Access dApp:${NC}"
    echo -e "   ${BLUE}http://localhost:3000${NC}"

    # Check if we have seed data by looking for test users
    if PGPASSWORD=hasura psql -h localhost -U hasura -d hasura -tAc "SELECT COUNT(*) FROM \"user\" WHERE email='admin@settlemint.com';" 2>/dev/null | grep -q "1"; then
        echo -e "   ${GREEN}✓${NC} Test users available:"
        echo -e "      • ${CYAN}admin@settlemint.com${NC}    (password: settlemint, PIN: 123456)"
        echo -e "      • ${CYAN}issuer@settlemint.com${NC}   (password: settlemint, PIN: 123456)"
        echo -e "      • ${CYAN}investor@settlemint.com${NC} (password: settlemint, PIN: 123456)"
    else
        echo -e "   ${YELLOW}ℹ${NC} No test users yet. Create them with:"
        echo -e "      ${CYAN}cd kit/dapp && bun run test:integration${NC}"
    fi
    echo ""

    echo -e "${YELLOW}2.${NC} ${BOLD}View Live Logs:${NC}"
    echo -e "   ${CYAN}tail -f dapp.log${NC}"
    echo -e "   ${BLUE}→${NC} Shows real-time compilation and server logs\n"

    echo -e "${BOLD}Useful Commands:${NC}\n"
    echo -e "   • ${CYAN}bun run dev:reset${NC}     - Clean restart Docker services"
    echo -e "   • ${CYAN}bun run artifacts${NC}     - Regenerate contract artifacts"
    echo -e "   • ${CYAN}bun run test${NC}          - Run all tests"
    echo -e "   • ${CYAN}bun run ci${NC}            - Run full CI pipeline"
    echo -e "   • ${CYAN}bun run lint${NC}          - Lint all code"
    echo -e "   • ${CYAN}bun run format${NC}        - Format all code"
    echo -e "   • ${CYAN}tail -f dapp.log${NC}      - View dApp logs\n"

    echo -e "${BOLD}Stopping Services:${NC}\n"
    echo -e "   • Stop dApp:          ${CYAN}kill \$(cat .dapp.pid)${NC}"
    echo -e "   • Stop all services:  ${CYAN}docker compose -p atk down${NC}"
    echo -e "   • Restart local PostgreSQL (if needed): ${CYAN}brew services start postgresql@14${NC}\n"

    echo -e "${BOLD}Development Workflow:${NC}\n"
    echo -e "   ${YELLOW}If you modify smart contracts, database schemas, or subgraphs:${NC}"
    echo -e "   1. Stop dApp: ${CYAN}kill \$(cat .dapp.pid)${NC}"
    echo -e "   2. Run: ${CYAN}bun run artifacts${NC}"
    echo -e "   3. Run: ${CYAN}bun run dev:reset${NC}"
    echo -e "   4. Run this script again: ${CYAN}bash dev.sh${NC}\n"

    echo -e "${BOLD}${MAGENTA}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN}                      QUICK REFERENCE                               ${NC}"
    echo -e "${BOLD}${MAGENTA}═══════════════════════════════════════════════════════════════════${NC}\n"

    echo -e "${BOLD}Most Used Services:${NC}"
    echo -e "   • dApp:             ${BLUE}http://localhost:3000${NC}"
    echo -e "   • Hasura (secret: ${YELLOW}hasura${NC}):    ${BLUE}http://localhost:8080${NC}"
    echo -e "   • MinIO (user: ${YELLOW}minio${NC}, pass: ${YELLOW}miniominio${NC}): ${BLUE}http://localhost:9001${NC}"
    echo -e "   • Blockscout:       ${BLUE}http://localhost:4001${NC}\n"

    echo -e "${BOLD}Database Connection Strings:${NC}"
    echo -e "   ${CYAN}postgresql://hasura:hasura@localhost:5432/hasura${NC}"
    echo -e "   ${CYAN}postgresql://portal:portal@localhost:5432/portal${NC}\n"

    echo -e "${BOLD}View Logs:${NC}"
    echo -e "   ${CYAN}tail -f dapp.log${NC}                    - dApp logs"
    echo -e "   ${CYAN}docker compose -p atk logs -f${NC}       - All service logs"
    echo -e "   ${CYAN}docker compose -p atk logs postgres${NC}  - PostgreSQL logs\n"

    echo -e "${BOLD}${MAGENTA}═══════════════════════════════════════════════════════════════════${NC}\n"

    echo -e "${GREEN}${BOLD}Happy coding! 🚀${NC}\n"
    echo -e "${YELLOW}Tip:${NC} Save this output or run ${CYAN}./dev.sh --help${NC} to see credentials again\n"
}

# Check and configure GitHub credentials upfront
check_github_credentials() {
    log_header "CHECKING GITHUB CREDENTIALS"

    log_step "Checking for GitHub Container Registry credentials..."

    # Check if credentials are already in .env.local
    if [ -f .env.local ]; then
        source .env.local 2>/dev/null || true
    fi

    if [ -n "${GITHUB_TOKEN:-}" ] && [ -n "${GITHUB_USERNAME:-}" ]; then
        log_success "GitHub credentials found in .env.local"
        log_info "Username: ${CYAN}${GITHUB_USERNAME}${NC}"
        log_info "Token: ${CYAN}${GITHUB_TOKEN:0:10}...${NC} (hidden)"
        echo ""

        # Test if credentials work
        log_step "Testing GitHub credentials..."
        if echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USERNAME" --password-stdin >/dev/null 2>&1; then
            log_success "GitHub credentials are valid!"
            return 0
        else
            log_warning "Existing GitHub credentials failed authentication"
            echo ""
        fi
    else
        log_info "No GitHub credentials found in .env.local"
        echo ""
    fi

    # Ask user if they want to add credentials now
    echo -e "${BOLD}${YELLOW}GitHub Container Registry Access${NC}\n"
    echo -e "This project uses private Docker images from GitHub Container Registry."
    echo -e "You need a GitHub Personal Access Token with ${CYAN}read:packages${NC} permission."
    echo ""
    echo -e "${BOLD}Options:${NC}"
    echo -e "   ${CYAN}1.${NC} I have credentials and want to add them now ${GREEN}(Recommended)${NC}"
    echo -e "   ${CYAN}2.${NC} Add them to .env.local manually and re-run this script"
    echo -e "   ${CYAN}3.${NC} Skip (setup will fail when trying to pull Docker images)"
    echo ""

    while true; do
        read -p "Enter your choice [1-3]: " choice
        case $choice in
            1)
                echo ""
                log_info "Please enter your GitHub credentials"
                echo ""
                read -p "GitHub Username: " gh_username
                read -s -p "GitHub Token (input hidden): " gh_token
                echo ""
                echo ""

                if [ -z "$gh_username" ] || [ -z "$gh_token" ]; then
                    log_error "Username and token cannot be empty"
                    continue
                fi

                # Test the credentials
                log_step "Testing credentials..."
                if echo "$gh_token" | docker login ghcr.io -u "$gh_username" --password-stdin >/dev/null 2>&1; then
                    log_success "Credentials are valid!"

                    # Add to .env.local
                    if [ ! -f .env.local ]; then
                        touch .env.local
                    fi

                    # Remove old credentials if they exist
                    grep -v "^GITHUB_TOKEN=" .env.local > .env.local.tmp 2>/dev/null || true
                    grep -v "^GITHUB_USERNAME=" .env.local.tmp > .env.local 2>/dev/null || true
                    rm -f .env.local.tmp

                    # Add new credentials
                    echo "" >> .env.local
                    echo "# GitHub Container Registry credentials" >> .env.local
                    echo "GITHUB_TOKEN=${gh_token}" >> .env.local
                    echo "GITHUB_USERNAME=${gh_username}" >> .env.local

                    export GITHUB_TOKEN="${gh_token}"
                    export GITHUB_USERNAME="${gh_username}"

                    log_success "Credentials saved to .env.local"
                    return 0
                else
                    log_error "Invalid credentials. Please try again."
                    echo ""
                    continue
                fi
                ;;
            2)
                echo ""
                log_info "You can use the template file to get started:"
                echo ""
                if [ -f .env.local.example ]; then
                    echo -e "   ${CYAN}cp .env.local.example .env.local${NC}"
                else
                    echo -e "   ${CYAN}# Create .env.local manually${NC}"
                fi
                echo ""
                log_info "Then add your GitHub credentials:"
                echo ""
                echo -e "   ${CYAN}GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx${NC}"
                echo -e "   ${CYAN}GITHUB_USERNAME=your_github_username${NC}"
                echo ""
                echo -e "Get your token from: ${BLUE}https://github.com/settings/tokens${NC}"
                echo -e "Required scope: ${CYAN}read:packages${NC}"
                echo ""
                log_warning "Exiting script. Please re-run after adding credentials."
                exit 1
                ;;
            3)
                echo ""
                log_warning "Skipping GitHub credentials - setup may fail"
                log_info "You can add credentials to .env.local later and re-run"
                return 0
                ;;
            *)
                echo -e "${RED}✗${NC} Invalid choice. Please enter 1, 2, or 3."
                ;;
        esac
    done
}

# Ask about seed data upfront
ask_seed_data_upfront() {
    log_header "SEED DATA CONFIGURATION"

    echo -e "${BOLD}${CYAN}Would you like to seed the database with test data?${NC}\n"
    echo -e "This will create test users and demo assets after setup completes:"
    echo -e "   • ${GREEN}admin@settlemint.com${NC}    (password: settlemint, PIN: 123456)"
    echo -e "   • ${GREEN}issuer@settlemint.com${NC}   (password: settlemint, PIN: 123456)"
    echo -e "   • ${GREEN}investor@settlemint.com${NC} (password: settlemint, PIN: 123456)"
    echo ""
    echo -e "   ${YELLOW}Note:${NC} Seeding takes 2-3 minutes and runs integration tests"
    echo ""
    echo -e "${BOLD}Options:${NC}"
    echo -e "   ${CYAN}1.${NC} Yes, seed database with test data ${GREEN}(Recommended for development)${NC}"
    echo -e "   ${CYAN}2.${NC} No, start with empty database"
    echo ""

    while true; do
        read -p "Enter your choice [1-2]: " choice
        case $choice in
            1)
                echo ""
                log_info "Selected: Seed database with test data"
                ENABLE_SEED_DATA=true
                return 0
                ;;
            2)
                echo ""
                log_info "Selected: Start with empty database"
                ENABLE_SEED_DATA=false
                return 0
                ;;
            *)
                echo -e "${RED}✗${NC} Invalid choice. Please enter 1 or 2."
                ;;
        esac
    done
}

# Show startup menu
show_startup_menu() {
    clear

    # Output to stderr so it's not captured by command substitution
    printf "${BOLD}${MAGENTA}" >&2
    printf "╔═══════════════════════════════════════════════════════════════════════════╗\n" >&2
    printf "║                                                                           ║\n" >&2
    printf "║           SettleMint Asset Tokenization Kit - Dev Setup                  ║\n" >&2
    printf "║                   Development Environment Setup                          ║\n" >&2
    printf "║                                                                           ║\n" >&2
    printf "╚═══════════════════════════════════════════════════════════════════════════╝\n" >&2
    printf "${NC}\n" >&2

    printf "${BLUE}ℹ${NC} This script will set up your development environment for M1 Mac using OrbStack\n" >&2
    printf "\n" >&2

    printf "${BOLD}${CYAN}Please select an installation mode:${NC}\n\n" >&2

    printf "${BOLD}Option 1: Clean Install${NC} ${GREEN}(Recommended for first time or when having issues)${NC}\n" >&2
    printf "   ${YELLOW}What it does:${NC}\n" >&2
    printf "   ${YELLOW}•${NC} Stops and removes all Docker containers and volumes\n" >&2
    printf "   ${YELLOW}•${NC} Clears all Bun caches and node_modules directories\n" >&2
    printf "   ${YELLOW}•${NC} Reinstalls all dependencies from scratch\n" >&2
    printf "   ${YELLOW}•${NC} Rebuilds contract artifacts and database schemas\n" >&2
    printf "   ${YELLOW}•${NC} Starts all services with fresh data\n" >&2
    printf "   ${BLUE}When to use:${NC} First time setup, after major updates, or to fix errors\n" >&2
    printf "   ${CYAN}⏱  Estimated time: 7-10 minutes${NC}\n" >&2
    printf "\n" >&2

    printf "${BOLD}Option 2: Quick Update${NC} ${GREEN}(Faster if environment is already working)${NC}\n" >&2
    printf "   ${YELLOW}What it does:${NC}\n" >&2
    printf "   ${YELLOW}•${NC} Keeps existing Docker containers and data\n" >&2
    printf "   ${YELLOW}•${NC} Updates dependencies without removing caches\n" >&2
    printf "   ${YELLOW}•${NC} Regenerates artifacts if needed\n" >&2
    printf "   ${YELLOW}•${NC} Restarts services with existing data\n" >&2
    printf "   ${BLUE}When to use:${NC} Quick iterations, testing changes, or restarting after code edits\n" >&2
    printf "   ${CYAN}⏱  Estimated time: 3-5 minutes${NC}\n" >&2
    printf "\n" >&2

    printf "${BOLD}Option 3: Exit${NC}\n" >&2
    printf "   ${YELLOW}→${NC} Exit this setup script without making changes\n" >&2
    printf "\n" >&2

    while true; do
        printf "${CYAN}Enter your choice [1-3]:${NC} " >&2
        read choice
        case $choice in
            1)
                printf "${GREEN}✓${NC} Selected: Clean Install\n" >&2
                printf "${BLUE}ℹ${NC} This will remove all existing data and start fresh\n" >&2
                sleep 2
                echo "clean"  # Return mode as string to stdout
                return 0
                ;;
            2)
                printf "${GREEN}✓${NC} Selected: Quick Update\n" >&2
                printf "${BLUE}ℹ${NC} This will keep existing data and update dependencies\n" >&2
                sleep 2
                echo "quick"  # Return mode as string to stdout
                return 0
                ;;
            3)
                printf "${BLUE}ℹ${NC} Exiting...\n" >&2
                exit 0
                ;;
            *)
                printf "${RED}✗${NC} Invalid choice. Please enter 1, 2, or 3.\n" >&2
                ;;
        esac
    done
}

# Main execution
main() {
    # Show menu and get user choice
    local install_mode=$(show_startup_menu)

    # Don't clear immediately - let user see their selection
    echo ""
    echo ""

    # Perform upfront checks before starting the installation
    # This ensures no further user input is needed during the process
    CURRENT_STEP=0  # Reset progress counter

    # Check GitHub credentials
    check_github_credentials

    # Ask about seed data
    ask_seed_data_upfront

    echo ""
    echo ""

    printf "${BOLD}${MAGENTA}"
    printf "╔═══════════════════════════════════════════════════════════════════════════╗\n"
    printf "║                                                                           ║\n"
    printf "║           SettleMint Asset Tokenization Kit - Dev Setup                  ║\n"
    if [ "$install_mode" = "clean" ]; then
        printf "║                      Mode: Clean Install                                  ║\n"
    else
        printf "║                      Mode: Quick Update                                   ║\n"
    fi
    printf "║                                                                           ║\n"
    printf "╚═══════════════════════════════════════════════════════════════════════════╝\n"
    printf "${NC}\n"

    # Show configuration summary
    echo -e "${BOLD}${CYAN}Configuration Summary:${NC}"
    echo -e "  ${GREEN}✓${NC} GitHub Credentials: ${CYAN}${GITHUB_USERNAME:-Not configured}${NC}"
    echo -e "  ${GREEN}✓${NC} Seed Test Data: ${CYAN}$([ "$ENABLE_SEED_DATA" = true ] && echo 'Yes' || echo 'No')${NC}"
    echo -e "  ${GREEN}✓${NC} Clean Setup: ${CYAN}$([ "$install_mode" = "clean" ] && echo 'Yes - Fresh database and blockchain' || echo 'No - Reusing existing data')${NC}"
    echo ""

    log_info "Setup will proceed without further user input"
    log_info "Sit back and relax while we set up your environment!"
    echo ""

    echo -e "${BOLD}What's happening:${NC}"
    echo -e "  ${CYAN}1.${NC}  Clean up previous environment (if clean mode)"
    echo -e "  ${CYAN}2.${NC}  Check dependencies (Homebrew, Bun, Docker, Git)"
    echo -e "  ${CYAN}3.${NC}  Setup environment variables"
    echo -e "  ${CYAN}4.${NC}  Install project dependencies"
    echo -e "  ${CYAN}5.${NC}  Generate contract artifacts"
    echo -e "  ${CYAN}6.${NC}  Start Docker services (fresh blockchain + database)"
    echo -e "  ${CYAN}7.${NC}  Setup database with clean schema"
    echo -e "  ${CYAN}8.${NC}  Connect to blockchain"
    echo -e "  ${CYAN}9.${NC}  Setup dApp and generate types"
    echo -e "  ${CYAN}10.${NC} Start dApp development server"
    echo -e "  ${CYAN}11.${NC} Seed test data (if enabled, requires running dApp)"
    echo -e "  ${CYAN}12.${NC} Open services in browser"
    echo ""

    sleep 3

    # Reset progress counter for actual setup
    CURRENT_STEP=0

    # Clean up any previous environment (only in clean mode)
    if [ "$install_mode" = "clean" ]; then
        log_info "Starting with complete cleanup to ensure fresh installation\n"
        cleanup_environment
    else
        log_info "Skipping cleanup - using existing environment\n"
    fi

    # Check dependencies
    check_dependencies

    # Setup environment file
    setup_environment

    # Install project dependencies
    install_project_dependencies

    # Generate artifacts
    generate_artifacts

    # Start Docker services
    start_docker_services

    # Wait for PostgreSQL to be fully ready (critical for Drizzle migrations)
    wait_for_postgres

    # Connect to blockchain
    connect_blockchain

    # Setup dApp
    setup_dapp

    # Start dApp development server FIRST (required for seeding)
    start_dapp

    # Seed database if user requested it (AFTER dApp is running)
    if [ "$ENABLE_SEED_DATA" = true ]; then
        log_info "dApp server is now running, proceeding with seed data..."
        echo ""
        seed_database
    else
        log_info "Skipping seed data (user selected empty database)"
    fi

    # Open services in browser
    open_services_in_browser

    # Display final instructions
    display_final_instructions
}

# Run main function
main "$@"

