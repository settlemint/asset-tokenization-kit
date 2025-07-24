# Asset Tokenization Kit - Artifacts Docker Image

This package builds a Docker image containing the ABIs and Genesis files for the Asset Tokenization Kit.

## Purpose

This Docker image is designed to be used as an init container in Kubernetes deployments to distribute artifacts (ABIs and Genesis files) without storing them directly in Helm charts.

## Contents

- **ABIs**: Smart contract ABIs from `kit/contracts/.generated/portal/`
- **Genesis**: Blockchain genesis configuration from `kit/contracts/.generated/genesis.json`

## Usage

The image is built automatically in CI and pushed to:
- `ghcr.io/settlemint/asset-tokenization-kit-artifacts`
- `harbor.settlemint.com/atk/asset-tokenization-kit-artifacts`

## Build

```bash
# From project root
bun run artifacts  # Generate artifacts first
cd kit/artifacts
bun run publish    # Build and push Docker image
```