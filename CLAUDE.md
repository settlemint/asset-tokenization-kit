# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

This is the SettleMint Asset Tokenization Kit - a full-stack solution for
building digital asset platforms. It consists of:

- Smart contracts for various tokenized assets (bonds, equity, stablecoins,
  funds, deposits)
- A Next.js dApp with TypeScript
- TheGraph subgraph for blockchain indexing
- Kubernetes deployment via Helm charts
- End-to-end tests using Playwright

## Key Commands

### Development Setup

```bash
# Install dependencies (uses Bun)
bun install

# Connect to SettleMint platform
bunx settlemint login
bunx settlemint connect

# Start development (predeployed contracts)
cd kit/dapp
bun codegen:settlemint
bun addresses
bun dev
```

### Testing & Quality Assurance

```bash
# Run full QA suite from root
bun run clean && bun install && bun run ci
```

### Contract Development

```bash
cd kit/contracts

# Compile contracts
bun compile:forge          # Foundry compilation
bun compile:hardhat        # Hardhat compilation

# Deploy contracts
bun deploy:remote          # Deploy to remote network
bun deploy:local           # Deploy to local network

# Generate artifacts
bun genesis                # Generate genesis configuration
bun abi-output            # Generate ABI files for portal
```

### Database Management

```bash
cd kit/dapp

# Database operations
bun db:push               # Push schema changes
bun db:pull               # Pull current schema
bun db:generate           # Generate migrations
```

### Subgraph Development

```bash
cd kit/subgraph

# Build and deploy
bun build                 # Build subgraph
bun deploy:remote         # Deploy to remote
bun deploy:local          # Deploy to local
```

## Architecture Overview

### Smart Contract Architecture

The contracts follow the SMART protocol (v8.0.15) and implement:

1. **Factory Pattern**: Each asset type has a factory contract that deploys
   asset instances

   - `SMARTBondFactory`, `SMARTEquityFactory`, `SMARTStableCoinFactory`, etc.
   - Located in `/kit/contracts/contracts/assets/`

2. **Proxy Pattern**: All assets use upgradeable proxies

   - Implementation contracts separate from proxy contracts
   - Enables upgradeability while maintaining state

3. **Extension System**: Modular features via extensions

   - `SMARTBurnable`, `SMARTCapped`, `SMARTCollateral`, `SMARTPausable`, etc.
   - Located in `/kit/contracts/contracts/extensions/`

4. **Compliance System**: ERC-3643 compliance
   - Identity registry, trusted issuers, claim topics
   - Located in `/kit/contracts/contracts/system/`

### Frontend Architecture

1. **Next.js App Router**: Modern React with server components

   - Located in `/kit/dapp/src/app/`
   - Internationalization via `next-intl`

2. **Database**: PostgreSQL with Drizzle ORM

   - Schema in `/kit/dapp/src/lib/db/`
   - Hasura GraphQL layer for querying

3. **Authentication**: Better Auth library

   - Configuration in `/kit/dapp/src/lib/auth/auth.ts`

4. **Blockchain Integration**:

   - Viem for contract interactions
   - Contract addresses in `/kit/dapp/src/lib/contracts.ts`
   - Generated types from contracts

5. **State Management**:
   - SWR for data fetching
   - React Hook Form for forms
   - Server actions via `next-safe-action`

### Deployment Architecture

1. **Kubernetes**: Helm charts for deployment

   - Main chart: `/kit/charts/atk/`
   - Includes Besu blockchain, Blockscout, Hasura, TheGraph

2. **Multi-environment**: Supports staging/production deployments
   - Environment configs via `.env` files
   - CI/CD via GitHub Actions

## Contract Addresses

The system uses deterministic addresses for factory contracts:

- Bond Factory: `0x5e771e1417100000000000000000000000000004`
- Cryptocurrency Factory: `0x5e771e1417100000000000000000000000000001`
- Equity Factory: `0x5e771e1417100000000000000000000000000003`
- Stable Coin Factory: `0x5e771e1417100000000000000000000000000002`
- Fund Factory: `0x5e771e1417100000000000000000000000000005`
- Deposit Factory: `0x5e771e1417100000000000000000000000000007`

## Development Workflow

1. **Feature Development**:

   - Create feature branch from `main`
   - Run tests locally before pushing
   - PR triggers full CI pipeline

2. **Contract Changes**:

   - Modify contracts in `/kit/contracts/contracts/`
   - Run `bun test` to verify
   - Update subgraph if events change
   - Regenerate types with `bun codegen`

3. **Frontend Changes**:

   - Work in `/kit/dapp/`
   - Hot reload with `bun dev`
   - Test with E2E tests

4. **Database Changes**:
   - Update schema in `/kit/dapp/src/lib/db/`
   - Run `bun db:push` to apply
   - Track with Hasura: `settlemint hasura track -a`
   - Regenerate GraphQL types: `bun codegen --force`

## CI/CD Pipeline

GitHub Actions workflows:

- **PR workflow** (`pr.yml`): Runs on all PRs

  - Linting, building, testing
  - Chart validation
  - Security scanning

- **Main workflow** (`main.yml`): Runs on main branch
  - Full test suite
  - Docker image building
  - Deployment to staging
  - Database migrations

## Important Notes

- Always run `bun codegen` after contract changes to regenerate TypeScript types
- The project uses Bun (v1.2.15) as the primary package manager
- Node.js v22.16.0 is required for TheGraph CLI
- Foundry is required for contract compilation and testing
- First user signup gets admin privileges in the dApp

## Memories

- Importing Zod: `import zod from zod/v4`
