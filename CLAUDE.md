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

## Documentation Requirements (MANDATORY)

**CRITICAL: For ANY code change, PR, task, or changeset, you MUST:**

1. **Validate** existing documentation in `kit/dapp/content/docs/` against your
   changes
2. **Update** affected documentation pages to reflect new behavior, APIs, or
   architecture
3. **Extend** documentation with new sections for new features or capabilities
4. **Improve** clarity, accuracy, and completeness based on what you've learned

**This is not optional. Documentation updates are REQUIRED as part of every
task.**

**Process:**

- After implementing code changes, identify impacted documentation pages
- Update technical accuracy (API signatures, component props, contract
  interfaces)
- Add examples demonstrating new functionality
- Update architecture diagrams if structure changed
- Ensure consistency with style guide in `kit/dapp/content/AGENTS.md`
- Cross-reference related pages that should link to new content

**Examples of documentation that must be updated:**

- Smart contract changes → Update contract reference and architecture docs
- API changes → Update API reference and developer guides
- New features → Update user guides, use cases, and feature documentation
- Architecture changes → Update system architecture and component docs
- Configuration changes → Update deployment guides and environment setup

**Remember: Code without updated documentation is incomplete work.**

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
  configured (@/_, @schemas/_, @test/\*)
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

## TanStack Start & React Best Practices — Don't fetch or derive app state in useEffect

### Core Rules

1. **Fetch on navigation** via route loaders (SSR + streaming); optionally seed
   via `queryClient.ensureQueryData`. \[1]
2. **Do server work on the server** via TanStack Start server functions; after
   mutations call `router.invalidate()` and/or
   `queryClient.invalidateQueries()`. \[2]
3. **Keep page/UI state in the URL** with typed search params (`validateSearch`,
   `Route.useSearch`, `navigate`). \[3]
4. **Reserve effects for real external effects only** (DOM, subscriptions,
   analytics). Compute derived state during render; `useMemo` only if expensive.
   \[4]\[6]
5. **Hydration + Suspense**: Any update that suspends during hydration replaces
   SSR content with fallbacks. Wrap sync updates that might suspend in
   `startTransition` (direct import). Avoid rendering `isPending` during
   hydration. `useSyncExternalStore` always triggers fallbacks during hydration.
   \[10]
6. **Data placement**:
   - Server-synced domain data → TanStack DB collections (often powered by
     TanStack Query via `queryCollectionOptions`, or a sync engine). Read with
     live queries. \[11]\[12]\[14]
   - Ephemeral UI/session (theme, modals, steppers, optimistic buffers) →
     local-only/localStorage collection. \[16]\[14]
   - Derived views → compute in render or via live queries. \[12]

### If Your useEffect Did X → Use Y

- Fetch on mount/param change → route loader (+ `ensureQueryData`). \[1]
- Submit/mutate → server function → then
  `router.invalidate()`/`qc.invalidateQueries()`. \[2]
- Sync UI ↔ querystring → typed search params + `navigate`. \[3]
- Derived state → compute during render (`useMemo` only if expensive). \[4]
- Subscribe external stores → `useSyncExternalStore` (expect hydration
  fallbacks). \[5]\[10]
- DOM/listeners/widgets → small `useEffect`/`useLayoutEffect`. \[6]
- Synced list + optimistic UI → DB query collection +
  `onInsert`/`onUpdate`/`onDelete` or server fn + invalidate. \[11]\[13]
- Realtime websocket/SSE patches → TanStack DB direct writes
  (`writeInsert/update/delete/upsert/batch`). \[13]
- Joins/aggregations → live queries. \[12]
- Local-only prefs/cross-tab → localStorage collection (no effects). \[14]

### Idioms (names only)

- **Loader**: `queryClient.ensureQueryData(queryOptions({ queryKey, queryFn }))`
  → read via `useSuspenseQuery` hydrated from loader. \[1]
- **DB query collection**:
  `createCollection(queryCollectionOptions({ queryKey, queryFn, queryClient, getKey }))`
  → read via live query. \[11]\[12]
- **Mutation (server-first)**: `createServerFn(...).handler(...)` → on success
  `qc.invalidateQueries`, `router.invalidate`; supports
  `<form action={serverFn.url}>`. \[2]
- **DB persistence handlers**: `onInsert`/`onUpdate`/`onDelete` → return
  `{ refetch?: boolean }`; pair with direct writes when skipping refetch. \[13]
- **Search params as state**:
  `validateSearch → Route.useSearch → navigate({ search })`. \[3]
- **External store read**: `useSyncExternalStore(subscribe, getSnapshot)`. \[5]
- **Hydration-safe**: `import { startTransition } from 'react'` for sync
  updates; avoid `useTransition`/`isPending` during hydration. \[10]

### Decision Checklist

- Needed at render → loader (defer/stream). \[1]\[7]
- User changed data → server fn → invalidate; or DB handlers/direct writes.
  \[2]\[13]
- Belongs in URL → typed search params. \[3]
- Purely derived → render/live query. \[4]\[12]
- External system only → effect. \[6]
- Hydration sensitive → `startTransition` for sync updates; expect fallbacks
  from external stores; avoid `isPending` during hydration. \[10]
- SSR/SEO → loader-based fetching with streaming/deferred; dehydrate/hydrate
  caches and DB snapshots. \[7]

### React 19 Helpers

- `useActionState` for form pending/error/result. \[8]
- `use` to suspend on promises. \[9]

### Hydration + Suspense Playbook \[10]

- **Rule**: Sync updates that suspend during hydration → fallback replaces SSR.
- **Quick fix**: Wrap updates with `startTransition` (direct import); re-wrap
  after `await`.
- **Avoid during hydration**: Using `useTransition` for the update, rendering
  `isPending`, `useDeferredValue` unless the suspensey child is memoized, any
  `useSyncExternalStore` mutation.
- **Safe during hydration**: Setting same value with `useState`/`useReducer`,
  `startTransition`-wrapped sync updates, `useDeferredValue` with `React.memo`
  around the suspensey child.
- **Compiler auto-memoization** may help; treat as optimization.

### Selective SSR

- Default `ssr: true` (change via `getRouter({ defaultSsr: false })`). SPA mode
  disables all server loaders/SSR.
- Per-route `ssr`: `true` | `'data-only'` | `false`.
- Functional `ssr(props)`: runs only on server initial request; can return
  `true` | `'data-only'` | `false` based on validated params/search.
- Inheritance: child can only get less SSR (true → `'data-only'` or false;
  `'data-only'` → false).
- Fallback: first route with `ssr: false` or `'data-only'` renders
  `pendingComponent` (or `defaultPendingComponent`) at least `minPendingMs` (or
  `defaultPendingMinMs`).
- Root: you can disable SSR of root route component; `shellComponent` is always
  SSRed.

**Docs map**: \[1] Router data loading, \[2] Server Functions, \[3] Search
Params, \[4] You Might Not Need an Effect, \[5] useSyncExternalStore, \[6]
Synchronizing with Effects, \[7] SSR, \[8] useActionState, \[9] use, \[10]
Hydration + Suspense, \[11] TanStack DB Collections, \[12] Live Queries, \[13]
DB Direct Writes, \[14] localStorage Collection.

## TanStack Start & React Best Practices — Don't fetch or derive app state in useEffect

### Core Rules

1. **Fetch on navigation** via route loaders (SSR + streaming); optionally seed
   via `queryClient.ensureQueryData`. \[1]
2. **Do server work on the server** via TanStack Start server functions; after
   mutations call `router.invalidate()` and/or
   `queryClient.invalidateQueries()`. \[2]
3. **Keep page/UI state in the URL** with typed search params (`validateSearch`,
   `Route.useSearch`, `navigate`). \[3]
4. **Reserve effects for real external effects only** (DOM, subscriptions,
   analytics). Compute derived state during render; `useMemo` only if expensive.
   \[4]\[6]
5. **Hydration + Suspense**: Any update that suspends during hydration replaces
   SSR content with fallbacks. Wrap sync updates that might suspend in
   `startTransition` (direct import). Avoid rendering `isPending` during
   hydration. `useSyncExternalStore` always triggers fallbacks during hydration.
   \[10]
6. **Data placement**:
   - Server-synced domain data → TanStack DB collections (often powered by
     TanStack Query via `queryCollectionOptions`, or a sync engine). Read with
     live queries. \[11]\[12]\[14]
   - Ephemeral UI/session (theme, modals, steppers, optimistic buffers) →
     local-only/localStorage collection. \[16]\[14]
   - Derived views → compute in render or via live queries. \[12]

### If Your useEffect Did X → Use Y

- Fetch on mount/param change → route loader (+ `ensureQueryData`). \[1]
- Submit/mutate → server function → then
  `router.invalidate()`/`qc.invalidateQueries()`. \[2]
- Sync UI ↔ querystring → typed search params + `navigate`. \[3]
- Derived state → compute during render (`useMemo` only if expensive). \[4]
- Subscribe external stores → `useSyncExternalStore` (expect hydration
  fallbacks). \[5]\[10]
- DOM/listeners/widgets → small `useEffect`/`useLayoutEffect`. \[6]
- Synced list + optimistic UI → DB query collection +
  `onInsert`/`onUpdate`/`onDelete` or server fn + invalidate. \[11]\[13]
- Realtime websocket/SSE patches → TanStack DB direct writes
  (`writeInsert/update/delete/upsert/batch`). \[13]
- Joins/aggregations → live queries. \[12]
- Local-only prefs/cross-tab → localStorage collection (no effects). \[14]

### Idioms (names only)

- **Loader**: `queryClient.ensureQueryData(queryOptions({ queryKey, queryFn }))`
  → read via `useSuspenseQuery` hydrated from loader. \[1]
- **DB query collection**:
  `createCollection(queryCollectionOptions({ queryKey, queryFn, queryClient, getKey }))`
  → read via live query. \[11]\[12]
- **Mutation (server-first)**: `createServerFn(...).handler(...)` → on success
  `qc.invalidateQueries`, `router.invalidate`; supports
  `<form action={serverFn.url}>`. \[2]
- **DB persistence handlers**: `onInsert`/`onUpdate`/`onDelete` → return
  `{ refetch?: boolean }`; pair with direct writes when skipping refetch. \[13]
- **Search params as state**:
  `validateSearch → Route.useSearch → navigate({ search })`. \[3]
- **External store read**: `useSyncExternalStore(subscribe, getSnapshot)`. \[5]
- **Hydration-safe**: `import { startTransition } from 'react'` for sync
  updates; avoid `useTransition`/`isPending` during hydration. \[10]

### Decision Checklist

- Needed at render → loader (defer/stream). \[1]\[7]
- User changed data → server fn → invalidate; or DB handlers/direct writes.
  \[2]\[13]
- Belongs in URL → typed search params. \[3]
- Purely derived → render/live query. \[4]\[12]
- External system only → effect. \[6]
- Hydration sensitive → `startTransition` for sync updates; expect fallbacks
  from external stores; avoid `isPending` during hydration. \[10]
- SSR/SEO → loader-based fetching with streaming/deferred; dehydrate/hydrate
  caches and DB snapshots. \[7]

### React 19 Helpers

- `useActionState` for form pending/error/result. \[8]
- `use` to suspend on promises. \[9]

### Hydration + Suspense Playbook \[10]

- **Rule**: Sync updates that suspend during hydration → fallback replaces SSR.
- **Quick fix**: Wrap updates with `startTransition` (direct import); re-wrap
  after `await`.
- **Avoid during hydration**: Using `useTransition` for the update, rendering
  `isPending`, `useDeferredValue` unless the suspensey child is memoized, any
  `useSyncExternalStore` mutation.
- **Safe during hydration**: Setting same value with `useState`/`useReducer`,
  `startTransition`-wrapped sync updates, `useDeferredValue` with `React.memo`
  around the suspensey child.
- **Compiler auto-memoization** may help; treat as optimization.

### Selective SSR

- Default `ssr: true` (change via `getRouter({ defaultSsr: false })`). SPA mode
  disables all server loaders/SSR.
- Per-route `ssr`: `true` | `'data-only'` | `false`.
- Functional `ssr(props)`: runs only on server initial request; can return
  `true` | `'data-only'` | `false` based on validated params/search.
- Inheritance: child can only get less SSR (true → `'data-only'` or false;
  `'data-only'` → false).
- Fallback: first route with `ssr: false` or `'data-only'` renders
  `pendingComponent` (or `defaultPendingComponent`) at least `minPendingMs` (or
  `defaultPendingMinMs`).
- Root: you can disable SSR of root route component; `shellComponent` is always
  SSRed.
