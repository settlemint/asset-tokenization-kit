# CLAUDE.md - Kit/Contracts Technology Stack

This document provides comprehensive guidance on the technologies, packages, and
architectural patterns used in the kit/contracts directory of the Asset
Tokenization Kit.

**⚠️ CRITICAL: AI agents MUST read the [./CLAUDE.md](./CLAUDE.md) shared
information before attempting any task to understand the project.**

## Core Technology Stack

### Smart Contract Development Frameworks

#### Primary Framework

- **Foundry** - Modern smart contract development framework
  - Compilation, testing, and formatting
  - Built-in fuzzing and coverage reporting
  - Gas reporting and optimization
  - Configuration: `foundry.toml`

#### Secondary Framework

- **Hardhat** - JavaScript-based development environment
  - Deployment and scripting support
  - Type generation from ABIs
  - Network management
  - Configuration: `hardhat.config.ts`

### Solidity Configuration

- **Compiler**: Solidity 0.8.28
- **EVM Version**: Cancun (latest)
- **Optimizer Settings**:
  - Enabled with 200 runs
  - Via IR compilation for advanced optimization
  - No bytecode hash for deterministic builds

### Package Management

- **Soldeer** - Solidity dependency manager
  - Manages external contract dependencies
  - Custom installation scripts with patching
  - Lock file: `soldeer.lock`

## Contract Libraries & Dependencies

### Core Libraries

- **OpenZeppelin Contracts** - Industry standard library
  - Standard contracts (ERC20, ERC721, etc.)
  - Upgradeable contracts library
  - Access control and security utilities
  - **MCP Tool Available**: Use `mcp__OpenZeppelinSolidityContracts__solidity-*`
    for quick generation

- **OnChain ID** - Identity management framework
  - ERC-734/735 implementation
  - Claim-based verification
  - Custom patches applied for compatibility

- **Forge Standard Library** - Testing utilities
  - Test helpers and assertions
  - Console logging for debugging
  - Mock and stub utilities

### Protocol Implementation

- **SMART Protocol** - Core tokenization framework
  - ERC-3643 compliant security tokens
  - Modular compliance system
  - Identity-based access control
  - Transfer restrictions and regulatory compliance

## Testing & Quality Assurance

### Testing Framework

- **Foundry Test Suite**
  - Fuzz testing: 1,000 runs (default), 10,000 (CI)
  - Coverage reporting with line/statement metrics
  - Gas reports for all contracts
  - Verbosity level 4 for CI debugging

### Test Organization

- Tests colocated in `/test` directory
- Organized by contract type:
  - Asset tests (Bond, Equity, Fund, etc.)
  - System component tests
  - Compliance module tests
  - Integration and reentrancy tests

### Test Utilities

- `SystemUtils` - System setup helpers
- `TokenUtils` - Token creation utilities
- `IdentityUtils` - Identity management helpers
- `ClaimUtils` - Claim creation utilities

## Code Quality & Formatting

### Linting

- **Solhint** - Solidity linter
  - Extends `solhint:recommended`
  - Custom rules for project conventions
  - Configuration: `.solhint.json`

### Formatting

- **Foundry Formatter** - Built-in code formatter
  - Line length: 120 characters
  - Tab width: 4 spaces
  - Bracket spacing enabled
  - Comment wrapping enabled

- **Prettier** - Global formatting
  - Experimental CLI support
  - Integrated with editor tooling

## Build & Deployment Tools

### Build System

- **Turbo** - Monorepo build orchestration
  - Parallel compilation tasks
  - Dependency graph management
  - Build caching

### Deployment Framework

- **Hardhat Ignition** - Module-based deployment
  - Deployment modules in `/ignition/modules/`
  - Reproducible deployments
  - Network-specific configurations

### Custom Tools

- **TypeScript Utilities** (in `/tools` directory)
  - `dependencies.ts` - Soldeer dependency management
  - `codegen-types.ts` - TypeScript type generation
  - `artifacts-genesis.ts` - Genesis file generation
  - `artifacts-abi.ts` - ABI extraction

### SettleMint Integration

- **SettleMint CLI** - Remote deployment support
  - Smart contract deployment commands
  - Network configuration management
  - Integration with platform services

## Architecture Patterns

### Proxy Architecture

- **UUPS Pattern** - Upgradeable contracts
  - Separate implementation and proxy contracts
  - Registry-based implementation management
  - Type-safe proxy deployment

### Factory Pattern

- **Central Registry** - `ATKTokenFactoryRegistry`
  - Manages all token factories
  - Type-based factory lookup
  - Deterministic deployment addresses

### Contract Types

- **Asset Tokens**:
  - Bond - Fixed-term debt instruments
  - Equity - Tokenized shares with dividends
  - Fund - Multi-asset portfolio tokens
  - Deposit - Time-locked deposits
  - StableCoin - Fiat-pegged tokens

## Security & Compliance

### Access Control

- **Role-Based Access Control (RBAC)**
  - System-level roles (Platform Admin, Deployer, etc.)
  - Token-level roles (Supply Manager, Compliance Manager, etc.)
  - Integrated with OpenZeppelin's AccessControl

### Compliance Framework

- **Modular Compliance System**
  - Country allow/block lists
  - Identity verification requirements
  - Address blocking capabilities
  - Transfer restriction rules

### Security Patterns

- **ReentrancyGuard** - Protection against reentrancy attacks
- **Pausable** - Emergency stop functionality
- **Two-step transfers** - Safe ownership changes
- **Initializer pattern** - Prevents re-initialization

## Development Workflow

### Compilation Pipeline

1. Soldeer dependency installation
2. Foundry compilation
3. Hardhat compilation
4. Type generation
5. ABI extraction

### Testing Pipeline

1. Unit tests with Foundry
2. Integration tests
3. Fuzz testing
4. Gas optimization reports
5. Coverage analysis

### Quality Gates

- Linting must pass
- All tests must pass
- Coverage thresholds
- Gas optimization checks
- Contract size limits (24KB)

## Network Configuration

### Development Networks

- **Hardhat Network** - In-memory blockchain
- **Anvil (Localhost)** - Local Ethereum fork
  - URL: http://127.0.0.1:8545
  - Zero gas price for testing

### Production Networks

- **BTP Network** - SettleMint blockchain
  - Configurable via environment
  - 15% gas multiplier
  - Custom chain ID support

## Best Practices

### Code Organization

- Contracts organized by type and function
- Clear separation of concerns
- Modular architecture
- Comprehensive documentation

### Security First

- All contracts upgradeable by design
- Comprehensive test coverage
- Gas optimization without compromising security
- Regular dependency updates

### Compliance Ready

- Built-in regulatory compliance
- Identity management integration
- Flexible rule configuration
- Audit trail capabilities

### Developer Experience

- Type-safe development
- Automated code generation
- Comprehensive tooling
- Clear deployment processes

## Integration Points

### Frontend Integration

- TypeScript types generated from ABIs
- React hooks for contract interaction
- Event listening and real-time updates

### Backend Services

- Portal GraphQL for transactions
- The Graph for indexing
- IPFS for metadata storage
- Identity service integration

This technology stack provides a professional-grade smart contract development
environment optimized for creating compliant, upgradeable, and secure tokenized
assets.
