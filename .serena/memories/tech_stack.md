# Technology Stack

## Core Technologies
- **Runtime**: Node.js, Bun (v1.2.19 as package manager)
- **Language**: TypeScript (v5.9.2) with strict mode
- **Monorepo**: Turborepo for task orchestration and caching

## Frontend Stack (kit/dapp)
- **Framework**: Next.js 15 with App Router
- **UI Libraries**: React, TanStack Query, TanStack Router, TanStack Form
- **Styling**: Tailwind CSS, Radix UI components
- **State Management**: TanStack Query, React Context
- **Authentication**: Better Auth
- **Internationalization**: i18next (supports en-US, de-DE, ja-JP, ar-SA)

## Backend/API Stack
- **API Framework**: ORPC (with Zod validation)
- **Database**: PostgreSQL with Drizzle ORM
- **GraphQL**: Hasura, TheGraph, gql.tada
- **Blockchain Interaction**: Viem, ethers

## Smart Contracts Stack (kit/contracts)
- **Languages**: Solidity
- **Frameworks**: Foundry, Hardhat
- **Testing**: Foundry tests, Hardhat tests

## Infrastructure & DevOps
- **Containerization**: Docker, Docker Compose
- **Orchestration**: Kubernetes with Helm charts
- **Local Blockchain**: Anvil (Foundry's local node)

## Testing Stack
- **Unit Tests**: Vitest (with React Testing Library for components)
- **E2E Tests**: Playwright
- **Contract Tests**: Foundry, Hardhat
- **Coverage**: Coveralls integration

## Development Tools
- **Code Quality**: ESLint, Prettier, Solhint (for Solidity)
- **Type Checking**: TypeScript strict mode
- **Build Tools**: Vite, Turbo
- **Git Hooks**: Lefthook

## Package Dependencies
- Workspace protocol (`workspace:*`) for internal dependencies
- Modern tooling with ESM-first approach
- Path aliases configured (@/*, @schemas/*, @test/*)