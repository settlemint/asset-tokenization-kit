# AGENTS

## Purpose

TanStack Start React 19 application delivering the user experience for the Asset
Tokenization Kit. Handles onboarding, asset management, compliance workflows,
and admin surfaces using ORPC APIs, Better Auth, and blockchain integrations.
Bundled with Vite and served by a Bun production server.

## Layout

```
dapp/
├── src/
│   ├── router.tsx        # TanStack Router bootstrap and route context wiring
│   ├── routes/           # File-based routes (createFileRoute, loaders, server fns)
│   ├── components/       # UI primitives, features, and design system wrappers
│   ├── lib/              # Domain logic, ORPC clients, Drizzle schemas, config
│   ├── providers/        # Global providers (query, auth, theming, analytics)
│   ├── styles/           # Tailwind tokens, global CSS, motion presets
│   ├── test/             # Shared test utilities and matchers
│   └── types/            # Shared TypeScript definitions
├── drizzle/              # SQL migrations managed via drizzle-kit
├── public/               # Static assets consumed by TanStack Start
├── server.ts             # Bun-based production server with smart asset loading
├── tools/                # Codegen and release scripts
└── vitest.config.ts      # Vitest project definitions (unit, integration)
```

## Dependencies (names only)

- **Local packages**: contracts, subgraph, @atk/config, @atk/zod
- **Key libraries**: TanStack Start, TanStack Router, TanStack Query, TanStack
  Form, React 19, Vite, Bun, Better Auth, ORPC, Drizzle ORM, Tailwind CSS, Radix
  UI, Viem, Sonner, motion, Lucide

## Best Practices (Local)

<!-- BEGIN AUTO -->

- **TanStack Start**: Organize all routes under `src/routes`; expose
  loaders/actions with `createServerFn`; regenerate `routeTree.gen.ts` via
  `bun run route:gen` whenever file-based routes change; prefer server modules
  for initial data hydration
- **TanStack Router**: Keep route contexts typed; colocate search param parsers
  and meta with the route file; memoize navigation helpers via
  `Route.useRouteContext`
- **TanStack Query**: Share a single query client in `src/providers`; hydrate
  SSR data with `prefetchQuery` and `dehydrate`; revalidate mutations with
  `invalidateRouteContext`
- **Better Auth**: Configure flows in `src/lib/auth`; gate protected routes
  through `Route.beforeLoad` (server) and `useAuth` (client); never store
  secrets outside `.env` management
- **Drizzle ORM**: Define schema in `src/lib/db/schemas`; run
  `bun --cwd kit/dapp db:generate` before migrations; apply via
  `bun --cwd kit/dapp db:migrate`
- **Styling**: Lean on Tailwind design tokens and `class-variance-authority`;
wrap Radix primitives inside `src/components/ui`; keep animations respecting
`prefers-reduced-motion`
<!-- END AUTO -->

## Style & Testing Cues

### TypeScript-only

- Strict mode with all safety flags enabled
- Path aliases: `@/*` for src, `@test/*` for test helpers
- Favor inferred return types; export shared types from `src/types`
- Server functions must return JSON-serializable payloads

### ESLint/Prettier deltas from root

- React hooks, TanStack Router, and boundaries rules enforced
- ESLint cache stored locally (`.eslintcache`)
- Formatting via root Prettier config (2 spaces, single quotes)

### Test locations

- Unit tests: colocated `*.test.ts(x)` inside `src`
- Integration tests: `test/` root directory
- Fixtures/mocks: `test/fixtures`, `test/mocks`, `src/test/fixtures`

## Agent Hints (Local)

!! **CRITICAL**: ALWAYS UPDATE, EXPAND AND IMPROVE THE FOLLOWING DOCUMENTATION
BASED ON THE CURRENT CHANGES YOU ARE MAKING: `README.md`, `docs/**`,
`AGENTS.md`, `CLAUDE.md`.

### Interface boundaries

- **Routing**: Never edit `routeTree.gen.ts`; change source routes and rerun the
  generator
- **Server functions**: Keep shared logic in `src/lib/server`; return
  serializable objects
- **Auth**: Use `src/lib/auth` helpers; enforce roles via `Route.beforeLoad` and
  `useAuth`

### Safe extension points

- Add routes beneath `src/routes` with typed loaders and actions
- Extend component library in `src/components/ui`
- Register ORPC procedures in `src/orpc/procedures` with matching client hooks
- Introduce database tables in `src/lib/db/schemas` and migrate through
  drizzle-kit

### What not to touch

- Generated artifacts: `routeTree.gen.ts`, GraphQL types, drizzle outputs
- `server.ts` asset preloading pipeline without platform sign-off
- Locale packs under `locales/` without translation workflow updates

### CI considerations

- Ensure `bun --cwd kit/dapp lint` and `typecheck` remain clean
- Regenerate route tree and codegen before commits
- Verify Drizzle schema and migrations remain synchronized, do not make your own
  migrations, use the drizzle kit commands
- Validate default locale translations exist for new keys
- Run `node tools/prune-unused-translations.cjs` after modifying UI copy. The
  script now parses the TypeScript AST, so install workspace dependencies first
  to provide the `typescript` runtime. Delete any fully empty JSON files (`{}`)
  that the pruning pass leaves behind.
