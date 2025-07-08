# Project Structure

## Overview

The SettleMint Asset Tokenization Kit is a comprehensive blockchain solution for tokenizing real-world assets. Built as a monorepo using Turborepo and Bun, it provides smart contracts, a modern web application, and complete infrastructure for deploying asset tokenization platforms.

**Technology Stack:**
- **Package Manager**: Bun v1.2.16
- **Monorepo Tool**: Turborepo
- **Smart Contracts**: Solidity, Foundry, Hardhat
- **Frontend**: React, TanStack Router, ORPC, Drizzle ORM
- **Backend Services**: Hasura GraphQL, The Graph, TX Signer
- **Infrastructure**: Docker Compose, Kubernetes (Helm)
- **Blockchain**: Ethereum-compatible (Anvil for local dev)

## Repository Structure

```
asset-tokenization-kit/
├── kit/                        # Main workspace directory
│   ├── charts/                 # Helm charts for Kubernetes deployment
│   ├── contracts/              # Smart contracts and tests
│   ├── dapp/                   # Modern React frontend application
│   ├── dapp-v1/               # Legacy frontend (DEPRECATED - DO NOT MODIFY)
│   ├── e2e/                   # End-to-end tests (Playwright)
│   └── subgraph/              # The Graph indexing configuration
├── tools/                      # Development tools and utilities
│   └── docker/                # Docker configuration files
├── docs/                       # Documentation
│   └── ai-context/            # AI-optimized documentation
├── docker-compose.yml         # Local development environment
├── package.json               # Root package configuration
├── turbo.json                 # Turborepo configuration
├── CLAUDE.md                  # Project guidelines for AI assistance
└── README.md                  # Project documentation
```

## Key Components

### 1. Smart Contracts (`kit/contracts/`)

The smart contract system implements a comprehensive asset tokenization framework:

**Asset Types:**
- **Bond**: Fixed-term debt instruments with interest
- **Equity**: Tokenized shares with dividend distribution
- **Fund**: Multi-asset portfolio tokens
- **Deposit**: Time-locked deposits with interest
- **StableCoin**: Fiat-pegged tokens with minting/burning

**Core Systems:**
- **SMART Protocol**: Modular compliance framework
- **OnChainID**: Decentralized identity management
- **Factory Pattern**: Upgradeable proxy contracts
- **Access Control**: Role-based permissions

**Structure:**
```
contracts/
├── contracts/
│   ├── assets/               # Asset token implementations
│   ├── system/               # Core system contracts
│   ├── smart/                # Compliance modules
│   ├── onchainid/           # Identity contracts
│   └── addons/              # Extensions (airdrops, vaults, etc.)
├── test/                     # Foundry test suite
├── dependencies/             # External contract dependencies
└── tools/                    # Contract build tools
```

### 2. Frontend Application (`kit/dapp/`)

Modern React application with server-side rendering and real-time updates:

**Tech Stack:**
- **Framework**: Vite + React
- **Routing**: TanStack Router (file-based)
- **RPC**: ORPC for type-safe server functions
- **Database**: Drizzle ORM with PostgreSQL
- **Styling**: Tailwind CSS
- **i18n**: Multi-language support (AR, DE, EN, JA)

**Structure:**
```
dapp/
├── src/
│   ├── routes/              # Page components (file-based routing)
│   ├── components/          # Reusable UI components
│   ├── tasks/              # ORPC server functions
│   ├── lib/                # Utilities and database
│   ├── hooks/              # React hooks
│   └── providers/          # Context providers
├── locales/                # Translation files
├── public/                 # Static assets
└── drizzle/               # Database migrations
```

### 3. Blockchain Indexing (`kit/subgraph/`)

The Graph protocol integration for querying blockchain data:

**Features:**
- Event indexing for all asset types
- Entity relationships and aggregations
- Real-time updates via GraphQL subscriptions
- Comprehensive statistics tracking

**Structure:**
```
subgraph/
├── src/
│   ├── token/              # Token event handlers
│   ├── system/             # System event handlers
│   ├── identity/           # Identity event handlers
│   └── stats/             # Statistical aggregations
├── schema.graphql          # GraphQL schema definition
└── subgraph.yaml          # Indexing configuration
```

### 4. Infrastructure (`kit/charts/`)

Kubernetes deployment configurations using Helm:

**Main Chart (`atk/`):**
- Orchestrates all application components
- Configurable for different environments
- Includes monitoring and observability

**Subcharts:**
- `besu-network/`: Private blockchain network
- `blockscout/`: Block explorer
- `hasura/`: GraphQL engine
- `thegraph/`: Blockchain indexing
- `portal/`: Admin interface
- `txsigner/`: Transaction signing service
- `dapp/`: Frontend application
- `observability/`: Monitoring stack
- `support/`: Infrastructure components

### 5. End-to-End Testing (`kit/e2e/`)

Comprehensive test suite using Playwright:

**Test Categories:**
- **UI Tests**: User flows, form validation, asset operations
- **API Tests**: Contract interactions, data validation
- **Integration Tests**: Full system workflows

**Structure:**
```
e2e/
├── ui-tests/              # Frontend user journey tests
├── api-tests/             # Backend API tests
├── pages/                 # Page object models
├── test-data/             # Test fixtures
└── utils/                 # Test utilities
```

## Development Workflow

### Local Development Setup

1. **Install Dependencies**
   ```bash
   bun install
   ```

2. **Generate Artifacts**
   ```bash
   bun run artifacts
   ```

3. **Start Services**
   ```bash
   bun run dev:up    # Start Docker services
   bun run dev       # Start development server
   ```

### Key Development Commands

```bash
# Quality Assurance
bun run ci              # Run full CI suite
bun run lint            # ESLint checking
bun run format          # Prettier formatting
bun run test            # Unit tests
bun run typecheck       # TypeScript validation

# Contract Development
bun run compile         # Compile contracts
bun run codegen         # Generate TypeScript types

# Testing
bun run test:e2e:ui     # UI tests
bun run test:e2e:api    # API tests
bun run test:integration # Integration tests

# Infrastructure
bun run dev:reset       # Reset local environment
bun run docker          # Build Docker images
bun run helm            # Package Helm charts
```

### Docker Services

The local development environment includes:

1. **Anvil**: Local Ethereum node (port 8545)
2. **PostgreSQL**: Database server (port 5432)
3. **Redis**: Caching layer (port 6379)
4. **MinIO**: S3-compatible storage (ports 9000, 9001)
5. **Hasura**: GraphQL engine (port 8080)
6. **Portal**: Admin UI (port 8001)
7. **The Graph**: Indexing service (ports 8000, 8020, 8030)
8. **Blockscout**: Block explorer (port 4000)
9. **TX Signer**: Transaction signing (port 8547)

## Architecture Patterns

### Smart Contract Architecture

1. **Proxy Pattern**: All assets use upgradeable proxies
2. **Factory Pattern**: Standardized deployment through factories
3. **Modular Compliance**: Pluggable compliance modules
4. **Role-Based Access**: Granular permission system

### Frontend Architecture

1. **Server Components**: Optimized initial load
2. **Type-Safe RPC**: ORPC for backend communication
3. **File-Based Routing**: Automatic route generation
4. **Optimistic Updates**: Immediate UI feedback

### Data Flow

1. **User Action** → Frontend (React)
2. **RPC Call** → ORPC Task (Server Function)
3. **Transaction** → TX Signer → Blockchain
4. **Event Emission** → The Graph Indexing
5. **Data Query** → GraphQL (Hasura/The Graph)
6. **UI Update** → Real-time Subscription

## Security Considerations

1. **Smart Contracts**
   - Upgradeable proxy pattern for fixes
   - Role-based access control
   - Compliance module integration
   - Extensive test coverage

2. **Frontend**
   - Authentication via multiple providers
   - Session management with encryption
   - Input validation and sanitization
   - CSRF protection

3. **Infrastructure**
   - Network isolation in Kubernetes
   - Secret management via environment variables
   - TLS encryption for all services
   - Regular security updates

## Performance Optimization

1. **Smart Contracts**
   - Gas-optimized implementations
   - Batch operations support
   - Efficient storage patterns

2. **Frontend**
   - Code splitting and lazy loading
   - Optimistic UI updates
   - GraphQL query optimization
   - CDN for static assets

3. **Infrastructure**
   - Horizontal pod autoscaling
   - Database connection pooling
   - Redis caching layer
   - Load balancing

## Maintenance Notes

- **Deprecated**: The `dapp-v1` folder is legacy code and should not be modified
- **Monorepo**: All packages are in the `kit/` workspace
- **Dependencies**: Managed by Bun with lockfile
- **Versioning**: Follows semantic versioning (currently v2.0.0)

---

*This document provides a comprehensive overview of the Asset Tokenization Kit structure. For specific component details, refer to the individual CLAUDE.md files in each directory.*