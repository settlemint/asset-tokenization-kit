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

## Package Management & Runtime

### Bun as Default Package Manager

Default to using the Bun package manager instead of NPM, PNPM or YARN.

- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`

### Bun as Default Runtime

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun run test` instead of `jest` or `vitest`
- Use `bun run build` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or
  `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

### Bun APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- `Bun.File()` for any file reading and writing
- `Bun.$` instead of execa.

For more information, read the Bun API docs in
`node_modules/bun-types/docs/**.md`.

## Complete Command Reference

### Root-Level Commands (Run from project root)

#### Core Development Commands
```bash
bun install               # Install all dependencies
bun run dev              # Start development environment (turbo dev + db:studio)
bun run dev:up           # Start Docker Compose services
bun run dev:reset        # Reset Docker environment (removes containers and volumes)
bun run clean            # Clean build artifacts and reinstall dependencies
```

#### CI/CD & Testing Commands
```bash
bun run ci               # Run full CI pipeline (format, compile, codegen, lint, test)
bun run ci:gha           # GitHub Actions CI pipeline (includes integration tests and build)
bun run ci:gha:main      # Main branch CI pipeline (includes publishing)
bun run test             # Run all tests
bun run test:integration # Run integration tests
bun run test:e2e:ui      # Run UI E2E tests
bun run test:e2e:ui:debug # Debug UI E2E tests with Playwright UI
bun run test:e2e:api     # Run API E2E tests
bun run test:e2e:api:debug # Debug API E2E tests
```

#### Build & Compilation Commands
```bash
bun run compile          # Compile all projects
bun run codegen          # Generate code for all projects
bun run build            # Build all projects
bun run artifacts        # Generate artifacts
```

#### Code Quality Commands
```bash
bun run lint             # Run linters across all projects
bun run format           # Format code across all projects
```

#### Utility Commands
```bash
bun run version          # Update version numbers
bun run helm             # Run Helm-related tasks
bun run db:studio        # Open Drizzle Studio
bun run extract-env      # Extract environment variables
bun run publish          # Publish artifacts
```

### Contract Commands (kit/contracts)

#### Compilation & Building
```bash
cd kit/contracts
bun compile:forge        # Compile with Foundry
bun compile:hardhat      # Compile with Hardhat
bun compile:typescript   # TypeScript type checking
```

#### Code Generation
```bash
bun codegen:types        # Generate TypeScript types from contracts
bun artifacts:genesis    # Generate genesis configuration
bun artifacts:abi        # Generate ABI files for portal
bun abi-output          # Generate ABI outputs
```

#### Testing & Deployment
```bash
bun test                 # Run Foundry tests with verbosity
bun deploy:remote        # Deploy to remote network
bun publish              # Deploy contracts locally
forge test -vvv          # Run tests with verbosity
forge test --gas-report  # Include gas usage report
forge test --match-test testName  # Run specific test
forge test --match-contract ContractName  # Test specific contract
```

#### Code Quality
```bash
bun lint                 # Run Solhint on contracts
bun format:forge         # Format Solidity with Forge
bun format:prettier      # Format with Prettier
```

#### Utilities
```bash
bun dependencies         # Check and update dependencies
bun clean:deployments    # Clean deployment artifacts
```

### dApp Commands (kit/dapp)

#### Development
```bash
cd kit/dapp
bun dev                  # Start Vite development server
bun build                # Build production bundle
bun watch                # Watch TypeScript for changes
```

#### Code Generation
```bash
bun codegen:settlemint   # Generate SettleMint SDK code
bun codegen:gql-tada     # Generate GraphQL types
bun addresses            # Display contract addresses
bunx shadcn@canary add <component> --cwd .  # Add shadcn component
```

#### Database Management
```bash
bun db:check             # Check database schema
bun db:push              # Push schema changes to database
bun db:export            # Export database
bun db:track             # Track tables with Hasura
bun db:studio            # Open Drizzle Studio GUI
bun db:auth:generate     # Generate Better Auth schema
```

#### Deployment
```bash
bun publish              # Build and push Docker image
```

#### Code Quality
```bash
bun typecheck            # Run TypeScript type checking
bun lint                 # Run ESLint
bun lint:fix             # Fix ESLint issues
bun format               # Format with Prettier
```

#### Internationalization
```bash
bun translate            # Run Languine translations
```

### Subgraph Commands (kit/subgraph)

#### Code Generation
```bash
cd kit/subgraph
bun codegen              # Generate AssemblyScript types
bun codegen:interfaceid  # Generate interface IDs
bun codegen:gql-tada     # Generate GraphQL schema and types
```

#### Building & Deployment
```bash
bun compile              # Build subgraph
bun publish              # Deploy to local Graph node
bun publish:remote       # Deploy to remote Graph node
bun deploy:local         # Deploy to local (alias)
bun deploy:remote        # Deploy to remote (alias)
```

#### Testing
```bash
bun test:integration     # Run integration tests
bun test:integration:local # Full local integration test suite
```

#### Code Quality
```bash
bun format               # Format with Prettier
```

### Charts/Helm Commands (kit/charts)

#### Kubernetes Management
```bash
cd kit/charts
bun reset                # Reset Orbstack Kubernetes cluster
bun helm                 # Deploy Helm chart
bun helm:check-context   # Verify Kubernetes context
bun helm:secrets         # Inject secrets from 1Password
bun helm:extract-env     # Extract environment variables
bun helm:connect         # Connect to SettleMint
bun helm:subgraph        # Update subgraph hash in values
```

#### Package Management
```bash
bun compile              # Generate Helm templates
bun package:harbor       # Package for Harbor registry
bun package:pack         # Create Helm package
bun package:push:harbor  # Push to Harbor
bun package:version      # Update package version
```

#### Utilities
```bash
bun dependencies         # Update dependencies
bun artifacts            # Copy artifacts
bun docs                 # Generate Helm documentation
```

### E2E Testing Commands (kit/e2e)

```bash
cd kit/e2e
bun test:e2e             # Run Playwright tests
bun test:e2e:ui          # Run tests with Playwright UI
bun test:e2e:ui:local    # Run tests against local environment
```

### Development Setup

```bash
# Initial setup
bun install
bunx settlemint login
bunx settlemint connect

# Start local environment
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

# The CI pipeline runs these in sequence:
# 1. Format check (turbo run format)
# 2. Compilation (turbo run compile)
# 3. Code generation (turbo run codegen)
# 4. Linting (turbo run lint)
# 5. Unit tests (turbo run test)
```

## Solidity Development Guidelines (kit/contracts)

### 1. General Principles

- **Think first, code second**: Minimize the number of lines changed and
  consider ripple effects across the codebase.
- **Prefer simplicity**: Fewer moving parts ➜ fewer bugs and lower audit
  overhead.

### 2. Assembly Usage

| Rule                                                                                                      | Rationale                                                             |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Use assembly only when essential.                                                                         | Keeps code readable and auditable.                                    |
| Assembly is mandatory for low-level external calls.                                                       | Gives full control over call parameters & return data, and saves gas. |
| Precede every assembly block with: • A brief justification (1-2 lines). • Equivalent Solidity pseudocode. | Documents intent for reviewers.                                       |
| Mark assembly blocks memory-safe when the Solidity docs' criteria are met.                                | Enables compiler optimizations.                                       |

### 3. Gas Optimization

- Keep a dedicated **Gas Optimization** section in the PR description; justify
  any measurable gas deltas.
- Prefer `calldata` over `memory`.
- Limit storage (`sstore`, `sload`) operations; cache in memory wherever
  possible.
- Use forge snapshot and benchmarks:
  ```bash
  cd kit/contracts
  forge snapshot                # Create gas snapshot
  forge test --gas-report       # Gas report for tests
  forge test --match-test bench # Run benchmarks
  ```
- Large regressions must be explained.

### 4. Handling "Stack Too Deep"

- **Struct hack (tests only)**: Bundle local variables into a temporary struct
  declared above the test.
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

**Every feature or change MUST have comprehensive tests before creating a PR**.
This is non-negotiable for maintaining code quality and preventing regressions.

#### When to Write Tests

- **New Features**: Write tests that demonstrate the complete flow and all edge
  cases
- **Bug Fixes**: Add tests that reproduce the bug and verify the fix
- **Refactoring**: Ensure existing tests still pass; add new ones if behavior
  changes
- **Gas Optimizations**: Include benchmark tests showing before/after
  comparisons

#### Types of Required Tests

**Unit Tests**:

- Write clear unit tests that demonstrate the general flow of your
  feature/change
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
- Use the established factory pattern (`ATKBondFactory`, `ATKEquityFactory`,
  etc.)
- Implement proper ERC-3643 compliance for all tokenized assets
- Utilize the extension system (`SMARTBurnable`, `SMARTCapped`, etc.) for
  modularity

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

### Turbo Pipeline Tasks

The project uses Turbo for monorepo management. These tasks are defined in turbo.json:

```bash
# Run any turbo task with:
turbo run <task>

# Available tasks:
ci                    # Full CI pipeline
ci:base               # Base CI tasks
ci:gha                # GitHub Actions CI
ci:gha:main           # Main branch CI
build                 # Build task with codegen dependency
codegen               # Code generation with dependencies
compile               # Compilation with dependencies
package               # Packaging (no cache)
publish               # Publishing (no cache)
dependencies          # Dependency management
format                # Code formatting
lint                  # Linting
dev                   # Development mode (persistent)
watch                 # Watch mode (persistent)
helm                  # Helm operations (no cache)
docs                  # Documentation generation
test                  # Testing
test:integration      # Integration testing
artifacts             # Artifact generation
db:studio             # Database studio (persistent)
```

### Docker Compose Services

Available services via docker-compose.yml:

```bash
# Start all services
bun run dev:up

# Available services:
anvil                 # Test blockchain node
graph-node-anvil      # Graph node for test environment
besu                  # Hyperledger Besu blockchain
txsigner              # Transaction signer service
postgres              # PostgreSQL database
portal                # Smart contract portal
redis                 # Redis cache
hasura                # GraphQL engine
graph-node            # The Graph indexing
minio                 # Object storage
blockscout-backend    # Blockchain explorer backend
blockscout-frontend   # Blockchain explorer frontend
```

### Environment Variables

The following environment variables are passed through Turbo:
- `THE_GRAPH_PORT_LOCAL_DEPLOY`
- `THE_GRAPH_PORT_LOCAL_QUERY`
- `FORCE_COLOR`
- `NO_COLOR`
- `TERM`
- `CI`
- `BUILD_ID`
- `GITHUB_SHA`
- `GIT_COMMIT`
- `GITHUB_REF_SLUG`
- `GITHUB_REF_NAME`
- `GITHUB_SHA_SHORT`

### Additional Tools & Utilities

1. **SettleMint CLI** - Used throughout for blockchain operations
2. **Foundry** - Smart contract development framework
3. **Hardhat** - Ethereum development environment
4. **Playwright** - E2E testing framework
5. **Drizzle** - Database ORM
6. **Better Auth** - Authentication library
7. **Vite** - Frontend build tool
8. **Turbo** - Monorepo build system
9. **Helm** - Kubernetes package manager
10. **Docker** - Container platform
11. **TheGraph** - Blockchain data indexing
12. **Hasura** - GraphQL engine
13. **Blockscout** - Blockchain explorer
14. **Languine** - Translation management
15. **1Password CLI** - Secret management

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

## Commit and PR Workflow

- Before committing, always run `bun run ci`
- When asked to create a PR, add all current changes, and analyse the branch
  history to accurately describe the changes.
- When pushing new changes to a branch with a PR, always update the title and
  description to describe the entire changeset
- On a clean branch/checkout, always run `bun install` followed by
  `bunx settlemint connect --instance local`
- Before opening a PR, make sure to run `bun run artifacts` to generate all the
  checked in generated code. Commit the changes.

## External Tools and Documentation

- use context7 mcp server to always inspect the latest version of the
  documentation
- if the user references a linear ticket, use the linear mcp server to check it
  out

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

## UI Components with shadcn

The following official shadcn-ui components are available. Please check to see
if they are installed under `./kit/dapp/components/ui` before installing them
with `bunx shadcn@canary add <component-id>`.

Notice that The 'shadcn-ui' package is deprecated. Please use the 'shadcn'
package instead. For example:

```bash
bunx shadcn@canary add progress --cwd kit/dapp
```

YOU MUST use `bunx shadcn@canary` when installing shadcn packages.

Docs for each components are available at
`https://ui.shadcn.com/docs/components/<component-id>`. Fetch and read the docs
before using the component so that your knowledge is up-to-date.

| #   | Component ID    | Human-friendly name | What it's for                                                                              |
| --- | --------------- | ------------------- | ------------------------------------------------------------------------------------------ |
| 1   | accordion       | Accordion           | Stack of headings that expand/collapse to reveal hidden content.                           |
| 2   | alert           | Alert               | Static call-out box for status or info messages.                                           |
| 3   | alert-dialog    | Alert Dialog        | Modal that interrupts the flow to confirm or warn about critical actions.                  |
| 4   | aspect-ratio    | Aspect Ratio        | Wrapper that locks children to a fixed width-to-height ratio (great for responsive media). |
| 5   | avatar          | Avatar              | Small user/asset image or initials placeholder.                                            |
| 6   | badge           | Badge               | Tiny label for counts or status (e.g. "New", "3").                                         |
| 7   | breadcrumb      | Breadcrumb          | Navigation trail that shows "where you are" in the app hierarchy.                          |
| 8   | button          | Button              | Click/tap element that triggers an action.                                                 |
| 9   | calendar        | Calendar            | Stand-alone calendar view, used by Date Picker or on its own.                              |
| 10  | card            | Card                | Content container with optional header/body/footer.                                        |
| 11  | carousel        | Carousel            | Horizontal slider that cycles through a set of items or images.                            |
| 12  | chart           | Chart               | Light wrapper for quick bar/line/pie visualizations.                                       |
| 13  | checkbox        | Checkbox            | Square control for on/off selection of independent items.                                  |
| 14  | collapsible     | Collapsible         | Utility that hides/reveals content with smooth height animation.                           |
| 15  | combobox        | Combobox            | Autocomplete text input that filters a long list and lets users pick an item.              |
| 16  | command         | Command Palette     | VS Code-style keyboard overlay for fuzzy-searching actions.                                |
| 17  | context-menu    | Context Menu        | Right-click (long-press) menu with context-specific commands.                              |
| 18  | data-table      | Data Table          | Table with helpers for sorting, filtering and pagination.                                  |
| 19  | date-picker     | Date Picker         | Input field that pops a calendar for choosing dates or ranges.                             |
| 20  | dialog          | Dialog              | Generic modal overlay for arbitrary interactive content.                                   |
| 21  | drawer          | Drawer              | Slide-in panel (often from edge/bottom) for secondary workflows.                           |
| 22  | dropdown-menu   | Dropdown Menu       | Triggered list of options/actions that auto-dismisses on selection.                        |
| 23  | form            | Form                | Helpers and styles for accessible, validated forms.                                        |
| 24  | hover-card      | Hover Card          | Lightweight popover that appears on hover/focus to show extra info.                        |
| 25  | input           | Input               | Standard single-line text field.                                                           |
| 26  | input-otp       | Input OTP           | Grouped inputs optimised for entering one-time pass-codes.                                 |
| 27  | label           | Label               | Accessible label element for any form control.                                             |
| 28  | menubar         | Menubar             | Horizontal desktop-app-style menu with dropdown sub-menus.                                 |
| 29  | navigation-menu | Navigation Menu     | Multi-level nav bar with active indicators and hover previews.                             |
| 30  | pagination      | Pagination          | Next/previous + numbered page controls for paginated data sets.                            |
| 31  | popover         | Popover             | Non-modal floating panel anchored to a trigger (e.g. emoji picker).                        |
| 32  | progress        | Progress            | Linear bar that shows completion percentage.                                               |
| 33  | radio-group     | Radio Group         | Set of mutually-exclusive selection buttons.                                               |
| 34  | resizable       | Resizable           | Wrapper that lets users drag to resize split panes.                                        |
| 35  | scroll-area     | Scroll Area         | Augments native scrolling with custom styling and shadows.                                 |
| 36  | select          | Select              | Styled single-select dropdown (native <select> replacement).                               |
| 37  | separator       | Separator           | Horizontal or vertical rule dividing content.                                              |
| 38  | sheet           | Sheet               | Mobile-friendly slide-up bottom sheet (from tiny to full-screen).                          |
| 39  | sidebar         | Sidebar             | Vertical navigation rail that can collapse/expand.                                         |
| 40  | skeleton        | Skeleton            | Grey placeholder shapes shown while real content loads.                                    |
| 41  | slider          | Slider              | Draggable handle on a track for numeric values or ranges.                                  |
| 42  | sonner          | Sonner              | Opinionated toast component (thin wrapper around the Sonner library).                      |
| 43  | switch          | Switch              | Toggle switch for true/false settings.                                                     |
| 44  | table           | Table               | Basic static table markup & styling.                                                       |
| 45  | tabs            | Tabs                | Tab strip that swaps between associated panels.                                            |
| 46  | textarea        | Textarea            | Multi-line text input.                                                                     |
| 47  | toast           | Toast               | Ephemeral message that pops at screen edge and auto-dismisses.                             |
| 48  | toggle          | Toggle              | Pressable button that stays pressed/un-pressed to indicate state.                          |
| 49  | toggle-group    | Toggle Group        | Collection of toggles acting as single- or multi-select controls.                          |
| 50  | tooltip         | Tooltip             | Small hover/focus label supplying helper text.                                             |

## Using Cast and Forge

### Cast - Command-Line Blockchain Interaction

Cast is Foundry's Swiss Army knife for interacting with Ethereum from the
command line. **Use Cast for blockchain utilities and quick operations** rather
than writing custom scripts for common tasks.

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

1. **Use Cast for prototyping**: Before writing a complex script, test your
   calls with Cast
2. **Verify with Cast**: After deployments, use Cast to verify contract state
3. **Debug with Cast**: Use `cast run` to debug failed transactions
4. **Prefer Cast for one-offs**: Don't write scripts for operations Cast can
   handle
5. **Chain Cast commands**: Combine Cast commands with shell scripting for
   powerful workflows

## TypeScript Best Practices

### Any inside generic functions

When building generic functions, you may need to use any inside the function
body.

This is because TypeScript often cannot match your runtime logic to the logic
done inside your types.

One example:

```ts
const youSayGoodbyeISayHello = <TInput extends "hello" | "goodbye">(
  input: TInput
): TInput extends "hello" ? "goodbye" : "hello" => {
  if (input === "goodbye") {
    return "hello"; // Error!
  } else {
    return "goodbye"; // Error!
  }
};
```

On the type level (and the runtime), this function returns `goodbye` when the
input is `hello`.

There is no way to make this work concisely in TypeScript.

So using `any` is the most concise solution:

```ts
const youSayGoodbyeISayHello = <TInput extends "hello" | "goodbye">(
  input: TInput
): TInput extends "hello" ? "goodbye" : "hello" => {
  if (input === "goodbye") {
    return "hello" as any;
  } else {
    return "goodbye" as any;
  }
};
```

Outside of generic functions, use `any` extremely sparingly.

### Default exports

Unless explicitly required by the framework, do not use default exports.

```ts
// BAD
export default function myFunction() {
  return <div>Hello</div>;
}
```

```ts
// GOOD
export function myFunction() {
  return <div>Hello</div>;
}
```

Default exports create confusion from the importing file.

```ts
// BAD
import myFunction from "./myFunction";
```

```ts
// GOOD
import { myFunction } from "./myFunction";
```

There are certain situations where a framework may require a default export. For
instance, Next.js requires a default export for pages.

```tsx
// This is fine, if required by the framework
export default function MyPage() {
  return <div>Hello</div>;
}
```

### Discriminated unions

Proactively use discriminated unions to model data that can be in one of a few
different shapes.

For example, when sending events between environments:

```ts
type UserCreatedEvent = {
  type: "user.created";
  data: { id: string; email: string };
};

type UserDeletedEvent = {
  type: "user.deleted";
  data: { id: string };
};

type Event = UserCreatedEvent | UserDeletedEvent;
```

Use switch statements to handle the results of discriminated unions:

```ts
const handleEvent = (event: Event) => {
  switch (event.type) {
    case "user.created":
      console.log(event.data.email);
      break;
    case "user.deleted":
      console.log(event.data.id);
      break;
  }
};
```

Use discriminated unions to prevent the 'bag of optionals' problem.

For example, when describing a fetching state:

```ts
// BAD - allows impossible states
type FetchingState<TData> = {
  status: "idle" | "loading" | "success" | "error";
  data?: TData;
  error?: Error;
};

// GOOD - prevents impossible states
type FetchingState<TData> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: TData }
  | { status: "error"; error: Error };
```

### Enums

Do not introduce new enums into the codebase. Retain existing enums.

If you require enum-like behaviour, use an `as const` object:

```ts
const backendToFrontendEnum = {
  xs: "EXTRA_SMALL",
  sm: "SMALL",
  md: "MEDIUM",
} as const;

type LowerCaseEnum = keyof typeof backendToFrontendEnum; // "xs" | "sm" | "md"

type UpperCaseEnum = (typeof backendToFrontendEnum)[LowerCaseEnum]; // "EXTRA_SMALL" | "SMALL" | "MEDIUM"
```

Remember that numeric enums behave differently to string enums. Numeric enums
produce a reverse mapping:

```ts
enum Direction {
  Up,
  Down,
  Left,
  Right,
}

const direction = Direction.Up; // 0
const directionName = Direction[0]; // "Up"
```

This means that the enum `Direction` above will have eight keys instead of four.

```ts
enum Direction {
  Up,
  Down,
  Left,
  Right,
}

Object.keys(Direction).length; // 8
```

### Import type

Use import type whenever you are importing a type.

Prefer top-level `import type` over inline `import { type ... }`.

```ts
// BAD
import { type User } from "./user";
```

```ts
// GOOD
import type { User } from "./user";
```

The reason for this is that in certain environments, the first version's import
will not be erased. So you'll be left with:

```ts
// Before transpilation
import { type User } from "./user";

// After transpilation
import "./user";
```

### Installing packages

When installing libraries, do not rely on your own training data.

Your training data has a cut-off date. You're probably not aware of all of the
latest developments in the JavaScript and TypeScript world.

This means that instead of picking a version manually (via updating the
`package.json` file), you should use a script to install the latest version of a
library.

```bash
bun add -D @typescript-eslint/eslint-plugin
```

This will ensure you're always using the latest version.

Prefer to install packages, not in the root, but in the mono repo packages

### Interface extends

ALWAYS prefer interfaces when modelling inheritance.

The `&` operator has terrible performance in TypeScript. Only use it where
`interface extends` is not possible.

```ts
// BAD

type A = {
  a: string;
};

type B = {
  b: string;
};

type C = A & B;
```

```ts
// GOOD

interface A {
  a: string;
}

interface B {
  b: string;
}

interface C extends A, B {
  // Additional properties can be added here
}
```

### JSDoc

Use JSDoc comments to annotate functions and types.

Be concise in JSDoc comments, and only provide JSDoc comments if the function's
behaviour is not self-evident for a novice developer.

Use the JSDoc inline `@link` tag to link to other functions and types within the
same file.

```ts
/**
 * Subtracts two numbers
 */
const subtract = (a: number, b: number) => a - b;

/**
 * Does the opposite to {@link subtract}
 */
const add = (a: number, b: number) => a + b;
```

### Naming conventions

- Use kebab-case for file names (e.g., `my-component.ts`)
- Use camelCase for variables and function names (e.g., `myVariable`,
  `myFunction()`)
- Use UpperCamelCase (PascalCase) for classes, types, and interfaces (e.g.,
  `MyClass`, `MyInterface`)
- Use ALL_CAPS for constants and enum values (e.g., `MAX_COUNT`, `Color.RED`)
- Inside generic types, functions or classes, prefix type parameters with `T`
  (e.g., `TKey`, `TValue`)

```ts
type RecordOfArrays<TItem> = Record<string, TItem[]>;
```

### No unchecked access

If the user has this rule enabled in their `tsconfig.json`, indexing into
objects and arrays will behave differently from how you expect.

```ts
const obj: Record<string, string> = {};

// With noUncheckedIndexedAccess, value will
// be `string | undefined`
// Without it, value will be `string`
const value = obj.key;
```

```ts
const arr: string[] = [];

// With noUncheckedIndexedAccess, value will
// be `string | undefined`
// Without it, value will be `string`
const value = arr[0];
```

### Optional properties

Use optional properties extremely sparingly. Only use them when the property is
truly optional, and consider whether bugs may be caused by a failure to pass the
property.

In the example below we always want to pass user ID to `AuthOptions`. This is
because if we forget to pass it somewhere in the code base, it will cause our
function to be not authenticated.

```ts
// BAD
type AuthOptions = {
  userId?: string;
};

const func = (options: AuthOptions) => {
  const userId = options.userId;
};
```

```ts
// GOOD
type AuthOptions = {
  userId: string | undefined;
};

const func = (options: AuthOptions) => {
  const userId = options.userId;
};
```

### Readonly properties

Use `readonly` properties for object types by default. This will prevent
accidental mutation at runtime.

Omit `readonly` only when the property is genuinely mutable.

```ts
// BAD
type User = {
  id: string;
};

const user: User = {
  id: "1",
};

user.id = "2";
```

```ts
// GOOD
type User = {
  readonly id: string;
};

const user: User = {
  id: "1",
};

user.id = "2"; // Error
```

### Return types

When declaring functions on the top-level of a module, declare their return
types. This will help future AI assistants understand the function's purpose.

```ts
const myFunc = (): string => {
  return "hello";
};
```

One exception to this is components which return JSX. No need to declare the
return type of a component, as it is always JSX.

```tsx
const MyComponent = () => {
  return <div>Hello</div>;
};
```

### Throwing

Think carefully before implementing code that throws errors.

If a thrown error produces a desirable outcome in the system, go for it. For
instance, throwing a custom error inside a backend framework's request handler.

However, for code that you would need a manual try catch for, consider using a
result type instead:

```ts
type Result<T, E extends Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

For example, when parsing JSON:

```ts
const parseJson = (input: string): Result<unknown, Error> => {
  try {
    return { ok: true, value: JSON.parse(input) };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
};
```

This way you can handle the error in the caller:

```ts
const result = parseJson('{"name": "John"}');

if (result.ok) {
  console.log(result.value);
} else {
  console.error(result.error);
}
```

## Memories

- Always include ./.cursor/rules/\*.mdc in your context to get the latest rules
  and tips
- Completely ignore dapp-v1 folder - it's deprecated
- Do not use vitest to make tests, use bun:test
- Always run `bun run ci` before suggesting a PR is ready
- Token factory creation now requires system bootstrapping first
- Asset types are centralized in the zod validator (no more cryptocurrency)
- never use barrel files
- For Solidity development in kit/contracts, always follow the Solidity
  Development Guidelines section
