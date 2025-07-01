# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

These rules are project specific rules for the SettleMint Asset Tokenization
Kit.

## Project Overview

The SettleMint Asset Tokenization Kit is a comprehensive blockchain solution for
tokenizing real-world assets. It's built as a Turborepo monorepo with the
following core components:

- **Smart Contracts** (`kit/contracts/`): Solidity contracts for various asset
  types (bonds, deposits, equity, funds, stablecoins) with compliance and
  identity management
- **dApp Frontend** (`kit/dapp/`): Next.js application with TypeScript, TanStack
  Router, and Vite
- **Subgraph** (`kit/subgraph/`): TheGraph indexing layer for blockchain data
- **E2E Tests** (`kit/e2e/`): Playwright tests for UI and API testing
- **Helm Charts** (`kit/charts/`): Kubernetes deployment configurations

## Essential Commands

### Development Workflow

```bash
# Initial setup
bun install
bun turbo link  # Enable remote caching

# Start local development environment
bun run dev:up    # Starts Docker Compose stack
bun run dev       # Starts dApp in development mode

# Clean restart (if needed)
bun run dev:reset # Removes Docker volumes and restarts
```

### Pre-Development Tasks

```bash
# CRITICAL: Run these before any linting/testing/formatting
bun artifacts     # Generate contract artifacts and genesis file
bun codegen      # Generate TypeScript types from GraphQL schemas
```

### Quality Assurance

```bash
# Complete QA pipeline (run before creating PRs)
bun run ci       # Runs: format, compile, codegen, lint, test

# Individual tasks
bun run format   # Prettier formatting
bun run lint     # ESLint
bun run test     # Unit tests (uses bun:test, not vitest)
bun run compile  # Compile smart contracts
```

### Testing

```bash
# Unit tests
bun run test

# E2E tests
bun run test:e2e:ui        # UI tests with Playwright
bun run test:e2e:ui:debug  # UI tests with debug mode
bun run test:e2e:api       # API tests with Playwright

# Integration tests
bun run test:integration

# Single test file
bun test path/to/test.spec.ts
```

### Contract Development

```bash
# Deploy contracts to local Anvil
bunx turbo contracts#publish

# Test subgraph integration
bunx turbo subgraph#test:integration
```

## Architecture

### Directory Structure

```
kit/
├── contracts/           # Smart contracts (Foundry + Hardhat)
│   ├── contracts/      # Solidity source files
│   ├── scripts/        # Deployment and management scripts
│   └── test/          # Contract tests
├── dapp/              # Next.js frontend application
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── routes/    # TanStack Router routes
│   │   └── lib/       # Utilities and configuration
│   └── locales/       # Internationalization files
├── subgraph/          # TheGraph indexing
├── e2e/              # End-to-end tests
└── charts/           # Helm charts for deployment
```

### Tech Stack

- **Package Manager**: Bun (default)
- **Monorepo**: Turborepo
- **Smart Contracts**: Solidity with Foundry and Hardhat
- **Frontend**: Next.js, TypeScript, Tanstack Start, Tanstack Query, TanStack
  Router, Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Testing**: bun:test for unit tests, Playwright for E2E
- **Blockchain**: Local Anvil node for development
- **Database**: PostgreSQL with Hasura GraphQL API

### Key Architectural Patterns

- **Asset Types**: Centralized in Zod validators (bonds, deposits, equity,
  funds, stablecoins)
- **Identity & Compliance**: OnChainID-based identity management with SMART
  token compliance
- **Proxy Pattern**: Upgradeable contracts using proxy implementations
- **Factory Pattern**: Dedicated factory contracts for asset creation
- **Access Control**: Role-based access with AccessManager integration

## Development Guidelines

### TypeScript (Ultracite Rules)

- **Strict mode always** - all strict compiler options enabled
- **Forbidden**: `any`, `@ts-ignore`, enums, namespaces, `var`
- **Preferred**: `type` over `interface`, `readonly` by default, no default exports
- **Naming**: kebab-case files, camelCase variables, PascalCase types, UPPER_SNAKE_CASE constants
- **Return types required** on top-level functions (except JSX components)
- **Modern patterns**: Discriminated unions, const assertions over enums, Result types, branded types
- **Code quality**: No unused imports/variables/parameters, === over ==, exhaustive switches
- **Schema-first**: Define Zod schemas, derive TypeScript types, use type guards
- **Error handling**: Use Result types, proper error handling with `new Error`

### React/Next.js Rules

- **Keys**: Never use array indices
- **Hooks**: Complete dependencies, top-level only
- **Components**: No nested components, prefer `<></>` over Fragment
- **Forbidden**: `<img>` in Next.js, prop assignment

### Git Workflow

- **Branch Rule**: NEVER commit to main - always create feature branches
- **Commit Format**: `type(scope): description` (lowercase description)
- **Types**: feat, fix, chore, docs, style, refactor, perf, test, build, ci,
  revert
- **Pattern**: One feature = one branch = one PR

### Code Quality

- **Logging**: Use
  `createLogger({ level: (process.env.SETTLEMINT_LOG_LEVEL as LogLevel) || "info" })`
  instead of console.log
- **No unused**: imports, variables, parameters, members
- **Modern practices**: for...of, template literals, async/await, object spread, numeric separators
- **Accessibility**: Valid ARIA usage, keyboard support (onClick→onKey*), meaningful labels/alt text, required attributes (lang, title, type), no accessKey or aria-hidden on focusable elements
- **Forbidden**: console.log, debugger, delete, eval, hardcoded secrets

## Important Constraints

### Files to Never Modify

- `kit/dapp/src/components/ui/` - shadcn components (kept immutable for
  upgrades)
- `routeTree.gen.ts` - Auto-generated by TanStack Router
- `dapp-v1/` - Deprecated folder (completely ignore)

### Required Patterns

- **No barrel files** - Avoid index.ts re-exports
- **No default exports** - Unless framework requires it
- **Schema-first** - Define Zod schemas, derive TypeScript types
- **Error handling** - Use Result types, proper error boundaries

### MCP Integration

- **Linear**: Project management, ticket updates, PR linking
- **Sentry**: Error tracking and issue management
- **Context7/DeepWiki**: Up-to-date library documentation

## Local Development Stack

The Docker Compose setup includes:

- **Anvil**: Local Ethereum node (port 8545)
- **PostgreSQL**: Database with Hasura GraphQL API
- **Redis**: Caching layer
- **Blockscout**: Block explorer
- **Portal**: SettleMint platform services

## Quality Control

Before any PR:

1. Run `bun run ci` successfully
2. Ensure all tests pass
3. Check TypeScript compilation
4. Verify contract deployment works locally

## Memories

- Completely ignore dapp-v1 folder - it's deprecated
- Do not use vitest to make tests, use bun:test
- Asset types are centralized in the zod validator (no more cryptocurrency)
- Never use barrel files
- Do not use console.log, use createLogger with SETTLEMINT_LOG_LEVEL
- Do not modify code in kit/dapp/src/components/ui (shadcn components)
- NEVER, EVER commit to main, if you are not on a branch, make a new one
- Run `bun artifacts` and `bun codegen` before running any
  testing/linting/formatting tasks
- `routeTree.gen.ts` is auto generated, ignore it
