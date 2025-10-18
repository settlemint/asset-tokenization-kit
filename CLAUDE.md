# CLAUDE.md

## Project Snapshot

The SettleMint Asset Tokenization Kit is a full-stack blockchain platform for
tokenizing real-world assets. It provides smart contracts, a React-based dApp,
subgraph indexing, and deployment automation for creating secure digital asset
platforms. Built as a Turborepo monorepo, it offers modular components for
bonds, equities, funds, stablecoins, and deposits with built-in compliance,
identity management, and yield mechanisms.

## Stack (names only)

Node, Bun, TypeScript, Turborepo, Tanstack Start, React, TanStack Query,
TanStack Router, TanStack Form, Tailwind CSS, Radix UI, Drizzle ORM, PostgreSQL,
Hasura, TheGraph, ORPC, Better Auth, Viem, Hardhat, Foundry, Solidity, Docker,
Kubernetes, Helm, Vitest, Playwright

## How to Run (Root Only)

- `bun install` - Install all dependencies across the monorepo
- `bun run dev` - Start development environment with Docker services
- `bun run dev:up` - Start Docker Compose setup for local development
- `bun run dev:reset` - Clean and restart Docker Compose with fresh state
- `bun run build` - Build all packages in dependency order
- `bun run test` - Run unit tests across all packages
- `bun run lint` - Lint all packages with ESLint
- `bun run format` - Format code with Prettier
- `bun run typecheck` - Type-check all TypeScript code
- `bun run ci` - Full CI pipeline (format, compile, codegen, lint, typecheck,
  build, test)
- `bun run artifacts` - Generate contract artifacts, genesis, and ABIs

## Structure

### Monorepo Architecture

```
kit/
├── contracts/       # Smart contracts (Solidity, Foundry, Hardhat)
├── dapp/           # Tanstack Start application
├── subgraph/       # TheGraph indexing protocol
├── e2e/            # Playwright E2E test suite
└── charts/         # Helm charts for Kubernetes deployment
```

### Workspace Dependencies

```
dapp → contracts (ABIs, types)
subgraph → contracts (ABIs, events)
e2e → dapp (testing UI/API)
```

### Package Manager

- **Bun** as primary package manager (see `package.json` for version)
- Workspace protocol: `workspace:*` for internal dependencies
- Turbo task filtering: Use package name directly (e.g.,
  `turbo run build --filter=dapp`)

## Best Practices (Cross-Cutting)

<!-- BEGIN AUTO -->

- **Turborepo**: Configure `dependsOn: ["^build"]` for correct build order; use
  `outputs` for caching build artifacts; mark dev tasks as `persistent: true`
  with `cache: false`
- **TypeScript**: Enable all strict flags (`strict: true`,
  `noUncheckedIndexedAccess`); use path aliases (@/\*) for clean imports;
  leverage type inference over explicit annotations
- **Viem**: Use type-safe contract interactions with generated ABIs; prefer
  `parseEther`/`formatEther` utilities; implement proper error handling with
  typed errors
- **Drizzle ORM**: Define schemas in TypeScript for type safety; use migrations
  for schema changes; leverage query builder over raw SQL
- **TanStack Query**: Configure stale time and cache time appropriately; use
  `useQuery` for reads, `useMutation` for writes; implement optimistic updates
  for better UX
- **ORPC**: Define procedures with Zod schemas for validation; use middleware
  for auth/logging; leverage type inference for end-to-end type safety
- **Docker**: Use multi-stage builds with `turbo prune` for optimized layers;
leverage build cache; minimize final image size with distroless/alpine bases
<!-- END AUTO -->

## Coding Standards & Tooling Mirror

- **TypeScript**: Strict mode enabled with `noImplicitAny`, `strictNullChecks`,
  `noUncheckedIndexedAccess`
- **Module resolution**: `bundler` mode with ESM-first approach, path aliases
  configured (@/*, @schemas/*, @test/*)
- **Formatting**: Prettier with 2-space indentation, trailing commas, single
  quotes for strings
- **Linting**: ESLint with React/TypeScript rules, max warnings = 0, boundaries
  plugin for package isolation
- **Component patterns**: Functional components with hooks, avoid class
  components, use composition over inheritance

## TypeScript Ergonomics

- Enable and maintain all strict compiler flags for maximum type safety
- Use branded types for domain IDs (UserId, TokenId, etc.) to prevent primitive
  obsession
- Leverage Zod for runtime validation with `z.infer<>` for derived types,
  avoiding duplicate type definitions

## Testing Guidance

- **Full test suite**: `bun run test` (runs Vitest across all packages)
- **Single test file**: `bun run test path/to/file.test.ts`
- **Test with UI**: `bun run --cwd kit/dapp test:unit:ui`
- **E2E tests**: `bun run test:e2e:ui` for UI tests, `bun run test:e2e:api` for
  API tests
- **Coverage**: `bun run --cwd kit/dapp test:unit:coverage`
- **Fixtures**: Located in `test/fixtures/` for each package

## CI Gates & Quality

### Automated Checks

- Format validation (Prettier)
- Compilation (Foundry + Hardhat for contracts, TypeScript for apps)
- Code generation (GraphQL types, contract types, SDK bindings)
- Linting (ESLint, Solhint for Solidity)
- Type checking (TypeScript strict mode)
- Unit tests (Vitest, Foundry tests)
- Coverage reporting (Coveralls integration)

### Local Reproduction

- Run full CI locally: `bun run ci`
- Pre-push validation: `bun run ci:base` (skips integration tests)
- Contract-specific: `bun run --cwd kit/contracts test`

## Security & Secrets

### Environment Files

- `.env.local` for local development (gitignored)
- `.env.example` as template with safe defaults
- Load order: `.env` → `.env.local` → environment variables

### CI/CD Secrets

- GitHub Actions uses 1Password service account for secret injection
- Secrets loaded via `1password/load-secrets-action`
- Never commit: private keys, API tokens, database credentials

### Local Development

- Docker Compose handles service credentials
- Use `settlemint connect --instance local` for blockchain connection
- Secrets mounted as environment variables in containers

## Agent Hints

### Architectural Boundaries

- **Smart Contracts**: Immutable once deployed; test thoroughly in
  `kit/contracts/test/`
- **Subgraph**: Schema changes require redeployment; test with
  `turbo subgraph#test:integration`

### Development Patterns

- Prefer editing existing files over creating new ones
- Follow established patterns in each package (check similar files first)
- Maintain workspace isolation - avoid cross-package imports except through
  `workspace:*` dependencies
- Use Turbo for all multi-package operations to respect dependency graph

### Safe Extension Points

- New smart contract features: Add to `kit/contracts/contracts/addons/`
- UI components: Place in `kit/dapp/src/components/ui/`
- API procedures: Extend routers in `kit/dapp/src/orpc/procedures/`
- Database schemas: Modify `kit/dapp/src/lib/db/schemas/` and run migrations
