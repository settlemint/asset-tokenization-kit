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

# Start local development environment
bun run dev:up            # Start Docker Compose services
bunx settlemint connect --instance local  # Connect to local instance

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

# Run specific test suites
bun run test              # All tests
bun run test:e2e:ui       # UI E2E tests
bun run test:e2e:ui:debug # Debug UI tests
bun run test:e2e:api      # API E2E tests

# Run contract tests
cd kit/contracts
bun test                  # Run all contract tests
forge test --match-test testName  # Run specific test
forge test --match-contract ContractName  # Test specific contract

# Linting and formatting
bun run lint              # Run all linters
bun run format            # Format code
```

### Contract Development

```bash
cd kit/contracts

# Compile contracts
bun compile:forge          # Foundry compilation
bun compile:hardhat        # Hardhat compilation
bun run compile            # Compile all

# Generate artifacts
bun genesis                # Generate genesis configuration
bun abi-output            # Generate ABI files for portal
bun codegen:types         # Generate TypeScript types

# Testing
forge test -vvv           # Run tests with verbosity
forge test --gas-report   # Include gas usage report
```

## Solidity Development Guidelines (kit/contracts)

### 1. General Principles

- **Think first, code second**: Minimize the number of lines changed and consider ripple effects across the codebase.
- **Prefer simplicity**: Fewer moving parts ➜ fewer bugs and lower audit overhead.

### 2. Assembly Usage

| Rule | Rationale |
|------|-----------|
| Use assembly only when essential. | Keeps code readable and auditable. |
| Assembly is mandatory for low-level external calls. | Gives full control over call parameters & return data, and saves gas. |
| Precede every assembly block with: • A brief justification (1-2 lines). • Equivalent Solidity pseudocode. | Documents intent for reviewers. |
| Mark assembly blocks memory-safe when the Solidity docs' criteria are met. | Enables compiler optimizations. |

### 3. Gas Optimization

- Keep a dedicated **Gas Optimization** section in the PR description; justify any measurable gas deltas.
- Prefer `calldata` over `memory`.
- Limit storage (`sstore`, `sload`) operations; cache in memory wherever possible.
- Use forge snapshot and benchmarks:
  ```bash
  cd kit/contracts
  forge snapshot                # Create gas snapshot
  forge test --gas-report       # Gas report for tests
  forge test --match-test bench # Run benchmarks
  ```
- Large regressions must be explained.

### 4. Handling "Stack Too Deep"

- **Struct hack (tests only)**: Bundle local variables into a temporary struct declared above the test.
- **Scoped blocks**: Wrap code in `{ ... }` to drop unused vars from the stack.
- **Internal helper functions**: Encapsulate logic to shorten call frames.
- **Refactor / delete unnecessary variables before other tricks**.

### 5. Security Checklist

- Review every change with an adversarial mindset.
- Favor the simplest design that meets requirements.
- After coding, ask: "What new attack surface did I introduce?"
- Reject any change that raises security risk without strong justification.
- Follow SMART protocol security patterns for ERC-3643 compliance.

### 6. Error Handling Style

Always use custom errors with the revert pattern instead of require statements:

```solidity
// ❌ Don't use require with string messages
require(amount > 0, "Amount must be positive");
require(to != address(0), "Cannot transfer to zero address");

// ✅ Do use custom errors with if/revert pattern
error AmountMustBePositive();
error CannotTransferToZeroAddress();

if (amount == 0) revert AmountMustBePositive();
if (to == address(0)) revert CannotTransferToZeroAddress();
```

**Benefits of custom errors**:
- More gas efficient than require strings
- Better error identification in tests and debugging
- Cleaner, more professional code
- Consistent with modern Solidity best practices

This applies to all Solidity code including contracts, libraries, and scripts.

### 7. Testing Guidelines

#### Core Testing Principles

**Every feature or change MUST have comprehensive tests before creating a PR**. This is non-negotiable for maintaining code quality and preventing regressions.

#### When to Write Tests

- **New Features**: Write tests that demonstrate the complete flow and all edge cases
- **Bug Fixes**: Add tests that reproduce the bug and verify the fix
- **Refactoring**: Ensure existing tests still pass; add new ones if behavior changes
- **Gas Optimizations**: Include benchmark tests showing before/after comparisons

#### Types of Required Tests

**Unit Tests**:
- Write clear unit tests that demonstrate the general flow of your feature/change
- Test both happy paths and failure cases
- Include edge cases and boundary conditions
- Test revert conditions with specific error messages

**Fuzz Tests**:
- **Fuzz tests are highly encouraged** for all new functionality
- Use Foundry's built-in fuzzing capabilities
- Apply random arguments to thoroughly test your implementation

Example fuzz test pattern:
```solidity
function testFuzz_myFeature(uint256 amount, address user) public {
    // Bound inputs to reasonable ranges
    amount = bound(amount, 1, type(uint128).max);
    vm.assume(user != address(0));
    
    // Test your feature with random inputs
    myContract.myFeature(amount, user);
    
    // Assert expected outcomes
    assertEq(myContract.balanceOf(user), amount);
}
```

#### Testing Checklist Before PR

Before opening any PR, ensure:
- [ ] All new functions have unit tests
- [ ] Critical paths have fuzz tests with random inputs
- [ ] Edge cases and revert scenarios are tested
- [ ] Gas benchmarks are included for optimizations
- [ ] All tests pass: `forge test`
- [ ] No test coverage regression: `forge coverage`

### 8. Verification Workflow

```bash
cd kit/contracts
forge build                    # compile
forge test                     # full test suite
forge snapshot                 # gas snapshot
forge test --match-test bench  # run benchmarks
forge test --gas-report        # gas usage report
forge coverage                 # code coverage
```

### 9. Asset Tokenization Kit Specific Guidelines

#### Contract Structure
- Follow the SMART protocol patterns for all asset implementations
- Use the established factory pattern (`ATKBondFactory`, `ATKEquityFactory`, etc.)
- Implement proper ERC-3643 compliance for all tokenized assets
- Utilize the extension system (`SMARTBurnable`, `SMARTCapped`, etc.) for modularity

#### Testing Assets
When testing tokenized assets:
- Test compliance features (identity registry, claim topics)
- Test factory deployment patterns
- Test proxy upgradeability
- Test all extensions used by the asset
- Include integration tests with the compliance system

#### Common Patterns
- Use `AccessControl` for role-based permissions
- Implement `Pausable` for emergency stops
- Follow ERC-3643 for identity and compliance
- Use proxy patterns for upgradeability

### Database Management

```bash
cd kit/dapp

# Database operations
bun db:push               # Push schema changes
bun db:pull               # Pull current schema
bun db:generate           # Generate migrations
bun db:studio             # Open Drizzle Studio GUI
```

### Subgraph Development

```bash
cd kit/subgraph

# Build and deploy
bun codegen               # Generate AssemblyScript types
bun build                 # Build subgraph
bun compile               # Compile subgraph
bun deploy:remote         # Deploy to remote
bun deploy:local          # Deploy to local
bun test:integration      # Run integration tests
```

## Architecture Overview

### Smart Contract Architecture

The contracts follow the SMART protocol (v8.0.15) and implement:

1. **Factory Pattern**: Each asset type has a factory contract that deploys
   asset instances

   - `ATKBondFactory`, `ATKEquityFactory`, `ATKStableCoinFactory`, etc.
   - Located in `/kit/contracts/contracts/assets/`

2. **Proxy Pattern**: All assets use upgradeable proxies

   - Implementation contracts separate from proxy contracts
   - Enables upgradeability while maintaining state

3. **Extension System**: Modular features via extensions

   - `SMARTBurnable`, `SMARTCapped`, `SMARTCollateral`, `SMARTPausable`, etc.
   - Located in `/kit/contracts/contracts/smart/extensions/`

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

- **QA workflow** (`qa.yml`): Main CI pipeline
  - Runs on PRs and main branch
  - Full test suite, linting, building
  - Security scanning (CodeQL, Trivy)
  - Uses Namespace Cloud for optimization

## Troubleshooting

### Common Issues

1. **Contract compilation fails**:

   - Ensure Foundry is installed: `curl -L https://foundry.paradigm.xyz | bash`
   - Run `foundryup` to update

2. **TheGraph CLI issues**:

   - Requires Node.js v22.16.0
   - Use nvm/fnm to switch Node versions

3. **Database connection issues**:
   - Ensure Docker services are running: `bun run dev:up`
   - Check `.env` file exists with correct DATABASE_URL

## Important Notes

- Always run `bun codegen` after contract changes to regenerate TypeScript types
- The project uses Bun (v1.2.10+) as the primary package manager
- Node.js v22.16.0 is required for TheGraph CLI
- Foundry is required for contract compilation and testing
- First user signup gets admin privileges in the dApp
- Never push directly to main branch

## Important Development Notes

### Deprecated Components

- **dapp-v1 folder**: This is completely deprecated and should be ignored. All
  modern development happens in `kit/dapp` which uses:
  - TanStack Start/Router/Query
  - Better Auth for authentication
  - Drizzle ORM with PostgreSQL

### Quality Assurance Suite

Before creating a PR, always run the full QA suite:

```bash
# Clean install and run full QA
bun run clean && bun install && bun run ci
```

The `bun run ci` command executes these tasks in sequence:

1. **Format Check** (`turbo run format`)

   - Prettier formatting validation
   - Ensures consistent code style
   - Auto-fixable with `bun run format`

2. **Compilation** (`turbo run compile`)

   - Smart contract compilation (Foundry + Hardhat)
   - Type generation from contracts
   - Dependency validation

3. **Code Generation** (`turbo run codegen`)

   - GraphQL schema type generation
   - Smart contract TypeScript bindings
   - SDK updates for all services

4. **Linting** (`turbo run lint`)

   - ESLint for TypeScript/JavaScript
   - Solhint for Solidity contracts
   - Strict type checking enabled

5. **Unit Tests** (`turbo run test`)
   - Contract tests via Foundry
   - Component tests for dApp
   - Database schema tests

### Environment Variables for Builds

The following environment variables are passed through Turbo for builds:

- `BUILD_ID`: Custom build identifier
- `GITHUB_SHA`: Git commit hash (for CI/CD)
- `GIT_COMMIT`: Alternative git commit reference

These are used for cache busting in production deployments.

### Cache Management

The dApp includes sophisticated cache management:

- **Query Cache Persistence**: Offline support via localStorage
- **Cross-Tab Sync**: Broadcast Channel API for multi-tab synchronization
- **Build-Based Cache Busting**: Automatic cache clearing on new deployments
- **Dev Shortcuts**:
  - `Cmd/Ctrl + Shift + K`: Clear all caches and reload
  - `Cmd/Ctrl + Shift + Q`: Clear query cache only
  - Console: `clearCache()` function available

### Authentication & Error Handling

- **Global UNAUTHORIZED Handler**: Automatic redirect to `/auth/sign-in` on 401
- **No Retry on Auth Failures**: Prevents unnecessary API calls
- **Cross-Tab Auth Sync**: Authentication state synchronized across tabs

## Using Cast and Forge

### Cast - Command-Line Blockchain Interaction

Cast is Foundry's Swiss Army knife for interacting with Ethereum from the command line. **Use Cast for blockchain utilities and quick operations** rather than writing custom scripts for common tasks.

#### Common Cast Utilities

**Cryptographic Operations:**
```bash
# Compute keccak256 hash
cast keccak "transfer(address,uint256)"

# Generate function selector (4-byte signature)
cast sig "transfer(address,uint256)"

# Encode calldata
cast calldata "transfer(address,uint256)" 0x... 1000

# Decode calldata
cast calldata-decode "transfer(address,uint256)" 0xa9059cbb...
```

**Reading from Blockchain:**
```bash
# Read contract state (call)
cast call CONTRACT_ADDRESS "balanceOf(address)" USER_ADDRESS --rpc-url $RPC_URL

# Get storage at specific slot
cast storage CONTRACT_ADDRESS 0 --rpc-url $RPC_URL

# Get transaction receipt
cast receipt TX_HASH --rpc-url $RPC_URL

# Get current gas price
cast gas-price --rpc-url $RPC_URL
```

**Writing to Blockchain:**
```bash
# Send transaction (write operation)
cast send CONTRACT_ADDRESS "setNumber(uint256)" 42 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

# Estimate gas for transaction
cast estimate CONTRACT_ADDRESS "transfer(address,uint256)" RECIPIENT 1000 --rpc-url $RPC_URL
```

**Data Conversion Utilities:**
```bash
# Convert between units
cast to-wei 1 ether        # Convert to wei
cast from-wei 1000000000000000000  # Convert from wei

# Hex conversions
cast to-hex 255            # Decimal to hex
cast to-dec 0xff           # Hex to decimal
cast to-uint256 100        # Convert to uint256 format

# Address utilities
cast to-checksum-address 0x...  # EIP-55 checksum
```

#### When to Use Cast vs Custom Code

**Use Cast for:**
- Quick keccak256 hashing of function signatures or data
- Reading contract state, storage slots, balances
- Sending simple transactions
- Converting between data formats (hex, decimal, wei, ether)
- Getting blockchain data (gas price, nonce, block info)
- Debugging transactions with traces
- Computing contract addresses before deployment

**Write custom code when:**
- Building complex multi-step interactions
- Implementing business logic
- Creating reusable libraries or contracts
- Needing programmatic control flow
- Building user interfaces or applications

### Best Practices

1. **Use Cast for prototyping**: Before writing a complex script, test your calls with Cast
2. **Verify with Cast**: After deployments, use Cast to verify contract state
3. **Debug with Cast**: Use `cast run` to debug failed transactions
4. **Prefer Cast for one-offs**: Don't write scripts for operations Cast can handle
5. **Chain Cast commands**: Combine Cast commands with shell scripting for powerful workflows

## Memories

- Always include ./.cursor/rules/\*.mdc in your context to get the latest rules
  and tips
- Completely ignore dapp-v1 folder - it's deprecated
- Do not use vitest to make tests, use bun:test
- Always run `bun run ci` before suggesting a PR is ready
- Token factory creation now requires system bootstrapping first
- Asset types are centralized in the zod validator (no more cryptocurrency)
- never use barrel files
- For Solidity development in kit/contracts, always follow the Solidity Development Guidelines section