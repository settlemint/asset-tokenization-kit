#!/usr/bin/env bash
set -euo pipefail

# Bootstraps a remote Codex workspace by ensuring Bun and project dependencies are installed.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

FOUNDRY_BIN="${HOME}/.foundry/bin"
if [[ -d "${FOUNDRY_BIN}" ]]; then
  export PATH="${FOUNDRY_BIN}:${PATH}"
fi

log() {
  printf "[codex-setup] %s\n" "$1"
}

ensure_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log "Missing required command: $1"
    return 1
  fi
}

run_with_privilege() {
  local cmd=("$@")

  if (( EUID == 0 )); then
    "${cmd[@]}"
    return
  fi

  if command -v sudo >/dev/null 2>&1; then
    sudo "${cmd[@]}"
    return
  fi

  log "Unable to escalate privileges to run: ${cmd[*]}"
  return 1
}

install_jq() {
  if command -v jq >/dev/null 2>&1; then
    log "jq already installed"
    return
  fi

  if command -v brew >/dev/null 2>&1; then
    log "Installing jq via Homebrew"
    if brew install jq >/dev/null; then
      log "jq installation complete via Homebrew"
      return
    fi
    log "Failed to install jq with Homebrew"
    exit 1
  fi

  if command -v apt-get >/dev/null 2>&1; then
    log "Installing jq via apt-get"
    if run_with_privilege apt-get update >/dev/null && \
      run_with_privilege apt-get install -y jq >/dev/null; then
      log "jq installation complete via apt-get"
      return
    fi
    log "Failed to install jq with apt-get"
    exit 1
  fi

  log "jq is required but no supported package manager found"
  exit 1
}

install_foundry() {
  log "Installing Foundry toolchain (forge/cast/anvil)"
  curl -fsSL https://foundry.paradigm.xyz | bash
  export PATH="${FOUNDRY_BIN}:${PATH}"
  if [[ -x "${FOUNDRY_BIN}/foundryup" ]]; then
    "${FOUNDRY_BIN}/foundryup"
    if ! command -v forge >/dev/null 2>&1; then
      log "Foundry installation did not make forge available"
      exit 1
    fi
  else
    log "foundryup not found after installation"
    exit 1
  fi
}

ensure_foundry() {
  if command -v forge >/dev/null 2>&1; then
    log "Foundry detected ($(forge --version | head -n1))"
    return
  fi

  ensure_command curl || {
    log "curl is required to install Foundry"
    exit 1
  }

  install_foundry
  log "Foundry installation complete ($(forge --version | head -n1))"
}

install_bun() {
  local bun_version
  if [[ -f .bun-version ]]; then
    bun_version="$(< .bun-version)"
  else
    bun_version="latest"
  fi

  log "Installing Bun ${bun_version}"
  curl -fsSL https://bun.sh/install | BUN_INSTALL="${HOME}/.bun" BUN_VERSION="${bun_version}" bash
  export BUN_INSTALL="${HOME}/.bun"
  export PATH="${BUN_INSTALL}/bin:${PATH}"
}

bootstrap_bun() {
  if command -v bun >/dev/null 2>&1; then
    log "Bun $(bun --version) already installed"
    return
  fi

  ensure_command curl || {
    log "curl is required to install Bun"
    exit 1
  }
  install_bun
  log "Bun installation complete"
}

install_dependencies() {
  log "Ensuring required CLI tooling is available"
  install_jq
  ensure_foundry

  log "Installing project dependencies with bun install"
  bun install

  log "Generating project artifacts via turbo"
  bun run artifacts

  if command -v docker >/dev/null 2>&1; then
    if docker compose version >/dev/null 2>&1; then
      log "Starting local services with docker compose"
      bun run dev:up
    else
      log "docker compose unavailable; skipping bun run dev:up"
    fi
  else
    log "Docker not detected; skipping bun run dev:up"
  fi
}

seed_dev_artifacts() {
  if [[ ! -f bun.lock ]]; then
    log "No bun.lock found; skipping lockfile validation"
  else
    log "bun.lock detected; dependencies locked"
  fi

  if [[ ! -d .vscode ]]; then
    log "Creating .vscode directory for workspace hints"
    mkdir -p .vscode
  fi

  cat > .vscode/settings.json <<'JSON'
{
  "typescript.tsdk": "${workspaceFolder}/node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "biome.lspBin": "${workspaceFolder}/node_modules/.bin/biome"
}
JSON
  log "Seeded VS Code workspace settings"
}

main() {
  log "Starting Codex environment bootstrap"
  bootstrap_bun
  install_dependencies
  seed_dev_artifacts
  log "Codex environment ready"
}

main "$@"
