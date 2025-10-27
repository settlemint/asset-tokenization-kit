# CLAUDE.md - dApp Package

## Purpose

TanStack Start React 19 application providing the web interface for the Asset
Tokenization Kit. Delivers onboarding, asset management, compliance workflows,
and administrative tooling backed by ORPC APIs, Better Auth, and blockchain
integrations. Bundled with Vite and served via a Bun production server that
preloads static assets intelligently.

## Layout

```
dapp/
├── src/
│   ├── router.tsx        # TanStack Router registration and context wiring
│   ├── routes/           # File-based routes (createFileRoute, loaders, actions)
│   ├── components/       # UI primitives, feature modules, design-system shells
│   ├── lib/              # Domain logic, ORPC clients, Drizzle schemas, config
│   ├── providers/        # Global providers (query, auth, theming, analytics)
│   ├── styles/           # Tailwind tokens, global CSS, motion presets
│   ├── test/             # Helpers, mocks, matchers for unit/integration tests
│   └── types/            # Shared TypeScript types and re-exports
├── drizzle/              # SQL migrations managed by drizzle-kit
├── locales/              # i18n resources (en-US, de-DE, ja-JP, ar-SA)
├── public/               # Static assets consumed by TanStack Start
├── server.ts             # Bun production server with asset preloading
├── tools/                # Codegen and release scripts
├── vitest.config.ts      # Vitest project config (unit + integration)
└── vite.config.ts        # Vite build pipeline with TanStack Start plugin
```

## Dependencies (names only)

- **Local packages**: contracts, subgraph, @atk/config, @atk/zod
- **Key libraries**: TanStack Start, TanStack Router, TanStack Query, TanStack
  Form, React 19, Vite, Bun, Better Auth, ORPC, Drizzle ORM, Tailwind CSS, Radix
  UI, Viem, Sonner, motion, Lucide

## Best Practices (Local)

<!-- BEGIN AUTO -->

- **TanStack Start**: Keep all routes inside `src/routes`; export
  loaders/actions via `createServerFn`; regenerate the router tree with
  `bun run route:gen` after adding files; prefer server modules for first render
  data
- **TanStack Router**: Define route contexts and search parameter schemas
  alongside each route; share layout state using `Route.useRouteContext`;
  leverage `Route.beforeLoad` for auth and feature gating
- **TanStack Query**: Hydrate server-side data with `prefetchQuery` +
  `dehydrate`; colocate query keys in `src/lib/query-keys.ts`; expire caches
  explicitly when blockchain state changes
- **Better Auth**: Centralize configuration in `src/lib/auth`; protect routes
  via server `beforeLoad` and client hooks; avoid persisting secrets outside
  managed env vars
- **Drizzle ORM**: Maintain schema definitions in `src/lib/db/schemas`; run
  `bun --cwd kit/dapp db:generate` then `db:migrate`; never edit generated
  migrations retroactively
- **Styling**: Use Tailwind design tokens and `class-variance-authority`; wrap
Radix primitives in `src/components/ui`; respect `prefers-reduced-motion` in
animations
<!-- END AUTO -->

## Style & Testing Cues

### TypeScript-only

- Strict compiler flags enabled (see root `tsconfig.base.json`)
- Path aliases: `@/*` for application code, `@test/*` for testing utilities
- Favor inferred return types; keep server functions JSON-serializable
- Export shared enums/types from `src/types`

### ESLint/Prettier deltas from root

- React hooks and TanStack Router rules active; zero lint warnings permitted
- ESLint cache stored locally (`.eslintcache`)
- Prettier enforces 2-space indentation, single quotes, trailing commas

### Test locations

- Unit tests: colocated `*.test.ts(x)` under `src`
- Integration tests: `test/` directory (Vitest integration project)
- Fixtures/mocks: `test/fixtures`, `test/mocks`, `src/test/fixtures`

## Agent Hints (Local)

!! **CRITICAL**: ALWAYS UPDATE, EXPAND AND IMPROVE THE FOLLOWING DOCUMENTATION
BASED ON THE CURRENT CHANGES YOU ARE MAKING: `README.md`, `docs/**`,
`AGENTS.md`, `CLAUDE.md`.

### Interface boundaries

- **Routing**: Do not edit `routeTree.gen.ts` manually—change source route files
  and rerun `bun run route:gen`
- **Server functions**: Use `createServerFn` helpers; return serializable data
  only
- **Auth**: Leverage `src/lib/auth` helpers and enforce roles via route guards

### Safe extension points

- Add new routes beneath `src/routes` with typed loaders/actions
- Extend the design system via `src/components/ui`
- Register ORPC procedures in `src/orpc/procedures` with matching clients
- Introduce database tables inside `src/lib/db/schemas` then migrate

### What not to touch

- Generated artifacts: `routeTree.gen.ts`, gql.tada outputs, Drizzle migrations
- `server.ts` asset preloader without platform approval
- Locale resources under `locales/` outside translation workflows

### CI considerations

- Keep `bun --cwd kit/dapp lint`, `typecheck`, and `test:unit` passing
- Regenerate router tree and codegen outputs before commit
- Verify Drizzle schema and migrations remain synchronized, do not make your own
  migrations, use the drizzle kit commands
- Ensure default locale entries exist for new translation keys
