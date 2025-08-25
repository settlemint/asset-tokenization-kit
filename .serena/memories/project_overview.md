# Asset Tokenization Kit - Project Overview

## Purpose
The SettleMint Asset Tokenization Kit is a full-stack blockchain platform for tokenizing real-world assets. It provides smart contracts, a React-based dApp, subgraph indexing, and deployment automation for creating secure digital asset platforms. The kit simplifies the creation of secure and scalable tokenization solutions with built-in tools for asset tracking, compliance workflows, and seamless blockchain interactions.

## Architecture
- **Monorepo Structure**: Uses Turborepo for managing multiple packages
- **Full-Stack Solution**: Includes smart contracts, web interface, indexing, and deployment tools
- **Modular Components**: Supports bonds, equities, funds, stablecoins, and deposits
- **Built-in Features**: Compliance, identity management, yield mechanisms, and admin dashboards

## Main Components
1. **kit/contracts** - Smart contracts (Solidity, Foundry, Hardhat)
2. **kit/dapp** - Next.js 15 App Router application (main UI)
3. **kit/subgraph** - TheGraph indexing protocol
4. **kit/e2e** - Playwright E2E test suite
5. **kit/charts** - Helm charts for Kubernetes deployment
6. **packages/** - Shared packages and configurations

## License
FSL-1.1-MIT (Functional Source License)

## Repository
https://github.com/settlemint/asset-tokenization-kit