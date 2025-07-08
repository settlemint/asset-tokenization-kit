# Deployment and Infrastructure Documentation

## Overview

The SettleMint Asset Tokenization Kit uses a containerized infrastructure with Docker Compose for local development and Helm charts for Kubernetes deployments. The platform supports multiple blockchain networks and provides a complete asset tokenization solution.

## Local Development with Docker Compose

### Quick Start

```bash
# Install dependencies and generate artifacts
bun install
bun run artifacts

# Start local development environment
bun run dev:up

# Reset environment (clean and restart)
bun run dev:reset

# Start development server
bun run dev
```

### Development Stack (from docker-compose.yml)

The local environment includes:
- **Anvil**: Local Ethereum test node (port 8545)
- **PostgreSQL**: Primary database with multiple schemas (port 5432)
- **Redis**: Caching and session management (port 6379)
- **MinIO**: S3-compatible object storage (ports 9000, 9001)
- **TX Signer**: Transaction signing service (port 8547)
- **Hasura**: GraphQL engine (port 8080)
- **Portal**: Blockchain configuration UI (port 8001)
- **The Graph**: Blockchain indexing (ports 8020, 8000, 8030, 5001)
- **Blockscout**: Block explorer (port 4000)

### Docker Compose Services

1. **Anvil Node**
   - Custom test node based on Foundry's Anvil
   - Zero gas configuration for testing
   - Chain ID: 1337
   - Preloaded with genesis contracts

2. **TX Signer Service**
   - Handles transaction signing
   - Connects to Anvil node
   - Uses test mnemonic for development

3. **Database Setup**
   - Multiple PostgreSQL databases: `anvil`, `txsigner`, `atk`, `hasura`, `blockscout`
   - Automatic initialization with schema
   - Health checks for reliability

4. **The Graph Stack**
   - Graph Node for indexing
   - IPFS for distributed storage
   - PostgreSQL for indexed data

## Container Strategy

### Docker Architecture

The platform uses multi-stage Docker builds:

```dockerfile
# Build stages for kit/dapp/Dockerfile:
FROM node:22-alpine AS base
FROM base AS dependencies
FROM dependencies AS builder
FROM node:22-alpine AS runner
```

### Key Docker Images
- **dapp**: React-based frontend application
- **dapp-v1**: Legacy frontend (deprecated)
- **contracts**: Smart contract compilation and deployment
- **subgraph**: The Graph indexing configuration

## Kubernetes Deployment

### Helm Charts Structure

```
kit/charts/
├── atk/                    # Main application chart
│   ├── Chart.yaml         # Chart metadata
│   ├── values.yaml        # Default configuration
│   └── charts/            # Subcharts
│       ├── besu-network/  # Private blockchain network
│       ├── blockscout/    # Block explorer
│       ├── dapp/          # Frontend application
│       ├── erpc/          # Ethereum RPC proxy
│       ├── hasura/        # GraphQL engine
│       ├── observability/ # Monitoring stack
│       ├── portal/        # Admin portal
│       ├── support/       # Infrastructure components
│       ├── thegraph/      # Indexing service
│       └── txsigner/      # Transaction signing
```

### Component Architecture

1. **DApp Service** (dapp/)
   - React frontend application
   - TanStack Router for navigation
   - ORPC for API communication
   - Multi-language support (AR, DE, EN, JA)

2. **Smart Contracts** (contracts/)
   - Asset tokenization contracts (Bond, Equity, Fund, Deposit, StableCoin)
   - SMART compliance framework
   - OnChainID identity management
   - Upgradeable proxy pattern

3. **TX Signer** (txsigner/)
   - Secure transaction signing
   - Key management
   - Multi-signature support

4. **The Graph** (thegraph/)
   - Blockchain event indexing
   - GraphQL API for querying
   - Real-time data synchronization

5. **Hasura** (hasura/)
   - GraphQL federation
   - Database abstraction
   - Real-time subscriptions

6. **Portal** (portal/)
   - Blockchain configuration UI
   - Network management
   - Contract deployment interface

### Deployment Configuration

Each service can be configured with:
- Resource limits and requests
- Horizontal Pod Autoscaling (HPA)
- Persistent volume claims
- Environment-specific configurations
- Health checks and readiness probes

## CI/CD Pipeline

### Development Workflow

1. **Code Quality** (`bun run ci`)
   - Format checking with Prettier
   - Linting with ESLint
   - Type checking with TypeScript
   - Smart contract compilation
   - Unit and integration tests

2. **Artifact Generation** (`bun run artifacts`)
   - Genesis file creation
   - Contract ABI extraction
   - Database schema export
   - Type generation

3. **Testing**
   - Unit tests: `bun run test`
   - Integration tests: `bun run test:integration`
   - E2E UI tests: `bun run test:e2e:ui`
   - E2E API tests: `bun run test:e2e:api`

### Build Optimization

**Turborepo Configuration**:
- Intelligent build caching
- Parallel task execution
- Dependency-aware builds
- Remote caching support

Key cached tasks:
- `compile`: Smart contract compilation
- `codegen`: Type generation
- `build`: Application builds
- `test`: Test execution

## Smart Contract Architecture

### Asset Types Supported

1. **Bonds** (ATKBond)
   - Fixed-term debt instruments
   - Interest rate management
   - Maturity tracking

2. **Equity** (ATKEquity)
   - Share tokenization
   - Dividend distribution
   - Voting rights

3. **Funds** (ATKFund)
   - Multi-asset portfolios
   - NAV calculation
   - Share management

4. **Deposits** (ATKDeposit)
   - Time-locked deposits
   - Interest accrual
   - Withdrawal management

5. **Stable Coins** (ATKStableCoin)
   - Fiat-pegged tokens
   - Minting/burning controls
   - Collateral management

### Compliance Framework

- **SMART Protocol**: Modular compliance system
- **OnChainID**: Identity verification
- **KYC/AML Integration**: Compliance module support
- **Transfer Restrictions**: Rule-based transfer controls

## Monitoring and Observability

### Available Tools

1. **Blockscout**: Full-featured block explorer
2. **The Graph**: Query blockchain data via GraphQL
3. **Hasura Console**: GraphQL API explorer
4. **Portal UI**: Contract interaction interface

## Security Implementation

### Smart Contract Security

1. **Upgradeable Proxies**
   - Implementation/proxy separation
   - Admin-controlled upgrades
   - Storage collision prevention

2. **Access Control**
   - Role-based permissions
   - Multi-signature support
   - Time-locked operations

3. **Compliance Controls**
   - Transfer restrictions
   - Identity verification
   - Regulatory compliance modules

### Infrastructure Security

1. **Network Isolation**
   - Service mesh architecture
   - Network policies
   - TLS encryption

2. **Secret Management**
   - Environment variables
   - Kubernetes secrets
   - Encrypted storage

## Deployment Operations

### Local Development Commands

```bash
# Start services
bun run dev:up

# Reset and restart
bun run dev:reset

# Run development server
bun run dev

# Build Docker images
docker compose build

# View logs
docker compose logs -f [service-name]
```

### Production Deployment

```bash
# Deploy with Helm
helm install atk ./kit/charts/atk \
  --namespace atk \
  --create-namespace \
  --values custom-values.yaml

# Upgrade deployment
helm upgrade atk ./kit/charts/atk \
  --namespace atk \
  --values custom-values.yaml
```

## Troubleshooting Guide

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   lsof -i :8545  # Anvil
   lsof -i :5432  # PostgreSQL
   lsof -i :8080  # Hasura
   ```

2. **Database Connection**
   ```bash
   # Connect to PostgreSQL
   docker compose exec postgres psql -U postgres -d atk
   ```

3. **Contract Deployment**
   ```bash
   # Deploy contracts manually
   bunx turbo contracts#publish
   ```

4. **Subgraph Indexing**
   ```bash
   # Check Graph Node logs
   docker compose logs -f graph-node
   ```

### Health Checks

All services include health check endpoints:
- Anvil: TCP check on port 8545
- PostgreSQL: `pg_isready` command
- Redis: `redis-cli ping`
- Hasura: HTTP check on `/healthz`
- Portal: HTTP check on `/api/health`

## Performance Optimization

### Caching Strategies

1. **Turborepo Cache**
   - Local and remote caching
   - Incremental builds
   - Parallel execution

2. **Docker Layer Caching**
   - Multi-stage builds
   - Dependency caching
   - Minimal runtime images

3. **Application Caching**
   - Redis for session data
   - GraphQL query caching
   - Static asset optimization

### Resource Management

- Container resource limits
- Database connection pooling
- Horizontal scaling capabilities
- Load balancing configuration