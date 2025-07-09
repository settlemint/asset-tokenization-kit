# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

**⚠️ CRITICAL: AI agents MUST read the [./claude/CLAUDE.md](./claude/CLAUDE.md)
shared information before attempting any task to understand the project.**

## Project Overview

**SettleMint Asset Tokenization Kit** - A full-stack solution for building
digital asset platforms with blockchain tokenization.

- **Version**: 2.0.0
- **License**: FSL-1.1-MIT
- **Type**: Monorepo using Turborepo and Bun
- **Purpose**: Accelerate development of compliant digital asset platforms with
  smart contracts and modern web UI

## Repository Structure

```
asset-tokenization-kit/
├── kit/                     # Main application packages
│   ├── contracts/          # Smart contracts (Solidity)
│   ├── dapp/              # Modern React/TypeScript frontend
│   ├── dapp-v1/           # ⚠️ DEPRECATED - DO NOT USE
│   ├── subgraph/          # TheGraph indexing
│   ├── e2e/               # End-to-end tests
│   └── charts/            # Helm charts for deployment
├── tools/                  # Root-level utilities
├── .claude/               # AI agent documentation
│   ├── CLAUDE.md         # Master AI context template
│   └── commands/         # Workflow command docs
└── docker-compose.yml     # Local development environment
```

## Essential Commands

### Development Setup

```bash
# Initial setup
bun install                      # Install dependencies
bunx settlemint connect --instance local  # Connect to SettleMint
bun run artifacts               # Generate artifacts (contracts, DB, ABIs)
bun run dev:up                  # Start Docker environment

# Daily development
bun run dev                     # Start dApp development server
bun run dev:reset              # Reset and restart Docker environment
```

### Quality Assurance

```bash
# Run full CI suite before creating PR
bun run ci                      # Runs: format, compile, codegen, lint, test

# Individual tasks
bun run format                  # Check code formatting
bun run lint                    # Run ESLint
bun run test                    # Run unit tests
bun run typecheck              # TypeScript type checking
bun run test:integration       # Integration tests
```

### Contract Development

```bash
# From root directory
bun run compile                 # Compile smart contracts
bun run codegen                # Generate TypeScript types
bun run artifacts              # Update genesis, DB, ABIs after contract changes
bun run contracts:test         # Run Foundry tests
```

## Technology Stack

### Smart Contracts (`kit/contracts`)

- **Language**: Solidity 0.8.28
- **Framework**: Foundry (primary), Hardhat (deployment)
- **Standards**: ERC-3643 compliant security tokens
- **Architecture**: UUPS upgradeable proxy pattern
- **Testing**: Foundry with fuzz testing
- **Libraries**: OpenZeppelin, OnChain ID, SMART Protocol

### Frontend (`kit/dapp`)

- **Framework**: React 19 with Tanstack Start
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4, Radix UI, shadcn/ui
- **State**: Tanstack Query, React Hook Form
- **API**: ORPC framework
- **Auth**: Better Auth
- **I18n**: i18next (Arabic, German, English, Japanese)
- **Build**: Vite with Bun

### Backend Services

- **Database**: PostgreSQL with Drizzle ORM
- **GraphQL**: Hasura, TheGraph, Portal, Blockscout
- **File Storage**: IPFS, MinIO
- **Blockchain**: Besu network (local development)

## Development Guidelines

### Git Workflow

```bash
# CRITICAL: Never commit to main branch
git checkout -b feature/your-feature-name  # Always create feature branch
git commit -m "type(scope): description"   # Use semantic commits
```

**Commit Types**: feat, fix, chore, docs, style, refactor, perf, test, build,
ci, revert

### Code Quality Rules

1. **Logging**: Use `createLogger()`, never `console.log`
2. **Error Handling**: Use error boundaries and toast notifications
3. **State Management**: Prefer URL state for persistence
4. **Imports**: No barrel files (index.ts exports)
5. **Testing**: Use `bun:test`, not vitest
6. **Components**: Keep files under 350 lines, split when needed
7. **Security**: Never commit secrets, validate all inputs

### Smart Contract Standards

- Explicit function visibility modifiers
- Comprehensive NatSpec comments
- Use OpenZeppelin contracts where possible
- Follow Checks-Effects-Interactions pattern
- Implement events for all state changes
- Use custom errors for gas efficiency

## Asset Types Supported

1. **Bond** - Fixed-term debt instruments
2. **Equity** - Tokenized shares with dividends
3. **Fund** - Multi-asset portfolio tokens
4. **Deposit** - Time-locked deposits
5. **StableCoin** - Fiat-pegged tokens

## Key Features

- **Compliance**: Modular compliance with identity management
- **Multi-language**: Full i18n support for 4 languages
- **Role-Based Access**: Platform and token-level permissions
- **Upgradeable**: All contracts use proxy pattern
- **Security First**: Built-in regulatory compliance

## Testing Strategy

```bash
# Unit tests
bun run test

# Integration tests
bun run test:integration

# E2E tests
bun run test:e2e:ui
bun run test:e2e:api

# Smart contract tests
cd kit/contracts && bun run test
```

## Deployment

### Local Development

```bash
bun run dev:up      # Start local environment
bun run dev         # Start dApp
```

### Production Build

```bash
bun run build       # Build all packages
bun run docker:codestudio  # Build Docker images
```

## Important Notes

1. **Deprecated**: `kit/dapp-v1` folder is completely deprecated - use
   `kit/dapp`
2. **Artifacts**: Regenerate after contract changes with `bun run artifacts`
3. **Docker Reset**: Use `bun run dev:reset` after artifact changes
4. **Type Safety**: Always run `bun run typecheck` before committing
5. **CI Required**: `bun run ci` must pass before creating PRs

## MCP Server Integration

The project integrates with:

- **Context7**: Library documentation (React, Next.js, etc.)
- **DeepWiki**: GitHub repository documentation
- **Linear**: Issue tracking and project management
- **Sentry**: Error tracking and monitoring

## Architecture Highlights

- **Monorepo**: Turborepo for efficient builds
- **Type-Safe**: End-to-end TypeScript with generated types
- **Modular**: Clear separation of concerns
- **Scalable**: Designed for enterprise deployments
- **Compliant**: Built-in regulatory compliance features

## Memories

- Completely ignore dapp-v1 folder - it's deprecated
- Do not use vitest to make tests, use bun:test
- Asset types are centralized in the zod validator (no more cryptocurrency)
- Never use barrel files
- Do not use console.log, use `const logger = createLogger()`
- Do not modify code in kit/dapp/src/components/ui (shadcn components)
- NEVER, EVER commit to main, if you are not on a branch, make a new one
- Run `bun artifacts` and `bun codegen` before running any
  testing/linting/formatting tasks
- `routeTree.gen.ts` is auto generated, ignore it
- Before starting any work, run `bunx settlemint connect --instance local` and
  `bun run codegen`
- Always use error boundaries (DefaultCatchBoundary for routes,
  DataTableErrorBoundary for tables)
- Use toast notifications with formatValidationError for user feedback
- Prefer URL state for persistent UI configuration, local state for ephemeral
  interactions
- Only optimize performance after measuring with React DevTools Profiler
- Translations are organized into focused namespaces - use multiple namespaces
  in components as needed
- Use very specific translation namespaces for each component (e.g.,
  "detail-grid" for the DetailGrid component, not "common")
- Tests are stored next to the route/component/file, not in a `__tests__` folder
- During refactors, if you encounter barrel files, remove them
- Do not store temporary analysis md files, and if you absolutely need to, make
  sure to clean them up before committing
- Never pass around `t` from the translations hook, if you cannot get `t` into a
  function, you shouldn't use such a function
- Use full types when possible, e.g. User and not { role?: string } if you just
  need the role
- Never use eslint-disable comments, fix the issues for real
- `as any` is NEVER allowed!
- Since we use Tanstack Start, we do not need `use client;`
- When i ask you to fix something, i do not care if it is related to our current
  change or not
