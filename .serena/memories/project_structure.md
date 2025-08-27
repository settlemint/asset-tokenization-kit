# Project Structure

## Root Directory
```
asset-tokenization-kit/
├── kit/                    # Main application packages
│   ├── contracts/          # Smart contracts (Solidity)
│   ├── dapp/              # Next.js web application
│   ├── subgraph/          # TheGraph indexing
│   ├── e2e/               # End-to-end tests
│   └── charts/            # Helm charts for K8s
├── packages/              # Shared packages
│   ├── config/            # Shared configurations
│   └── zod/               # Shared Zod schemas
├── tools/                 # Build and dev tools
├── docker-compose.yml     # Local development setup
├── turbo.json            # Turborepo configuration
├── package.json          # Root package.json
└── bun.lock              # Lock file for Bun

## Key Directories in kit/dapp
kit/dapp/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   │   ├── ui/          # Radix UI components
│   │   └── forms/       # Form components
│   ├── orpc/            # ORPC API procedures
│   │   ├── procedures/  # API endpoints
│   │   └── routes/      # Route definitions
│   ├── lib/             # Utilities and configs
│   │   ├── auth/        # Authentication setup
│   │   ├── db/          # Database schemas
│   │   └── i18n/        # Internationalization
│   ├── hooks/           # Custom React hooks
│   └── providers/       # Context providers
├── drizzle/             # Database migrations
├── locales/             # Translation files
├── public/              # Static assets
└── test/                # Test fixtures

## Workspace Dependencies
- dapp depends on contracts (for ABIs and types)
- subgraph depends on contracts (for events)
- e2e depends on dapp (for testing)

## Generated Files (Don't Edit)
- `*.gen.ts` files
- `.generated/` directories
- `routeTree.gen.ts`
- GraphQL type definitions
- Interface IDs
- Contract artifacts

## Configuration Files
- `turbo.json` - Turborepo task configuration
- `docker-compose.yml` - Local services
- `tsconfig.json` - TypeScript config (per package)
- `vitest.config.ts` - Test configuration
- `drizzle.config.ts` - Database config
- `.prettierrc` - Code formatting
- `eslint.config.ts` - Linting rules

## Environment Files
- `.env` - Default values (committed)
- `.env.local` - Local overrides (gitignored)
- `.env.example` - Template for developers

## Docker Services (Local Dev)
- Anvil - Local blockchain node
- PostgreSQL - Main database
- Hasura - GraphQL engine
- Redis - Caching
- MinIO - Object storage
- Portal - Blockchain explorer
- Subgraph Node - TheGraph indexing