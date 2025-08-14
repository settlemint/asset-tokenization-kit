# CLAUDE.md - dApp Package

## Purpose

Next.js 15 application providing the web interface for the Asset Tokenization
Kit. Features authentication, asset management, compliance workflows, and admin
dashboards. Built with App Router, Server Components, and real-time data from
blockchain and GraphQL sources.

## Layout

```
dapp/
├── src/
│   ├── app/            # Next.js App Router pages and layouts
│   ├── components/     # React components (UI, forms, charts)
│   ├── orpc/          # ORPC API procedures and routers
│   ├── lib/           # Utilities, database, auth, i18n
│   ├── hooks/         # Custom React hooks
│   └── providers/     # Context providers
├── drizzle/           # Database migrations
├── locales/           # i18n translations (en-US, de-DE, ja-JP, ar-SA)
├── public/            # Static assets
└── test/              # Test fixtures and helpers
```

## Dependencies (names only)

- **Local packages**: contracts (workspace dependency)
- **Key libraries**: Next.js, React, TanStack Router, TanStack Query, TanStack
  Form, Radix UI, Tailwind CSS, Drizzle ORM, Better Auth, ORPC, Viem, Zod,
  i18next, Recharts, Motion, Lucide Icons

## Best Practices (Local)

<!-- BEGIN AUTO -->

- **Next.js App Router**: Colocate data fetching with components; use parallel
  routes for modals; implement intercepting routes for smooth navigation;
  leverage route groups for organization without affecting URLs
- **React Server Components**: Fetch data at component level without props
  drilling; use Suspense boundaries for streaming; minimize 'use client'
  directives; pass serializable props to Client Components
- **TanStack Query**: Configure query keys consistently; implement
  stale-while-revalidate patterns; use mutation callbacks for optimistic UI;
  leverage query invalidation for cache updates
- **Tailwind CSS**: Use semantic color tokens from design system; leverage
  component variants with CVA; avoid arbitrary values; compose utilities for
  complex styles
- **Drizzle ORM**: Define relations in schema for type-safe joins; use prepared
  statements for performance; implement soft deletes where appropriate; version
  migrations sequentially
- **Better Auth**: Implement session validation in middleware; use PKCE flow for
OAuth; store sensitive data in httpOnly cookies; implement rate limiting on auth
endpoints
<!-- END AUTO -->

## Style & Testing Cues

### TypeScript-only

- Strict mode with all safety flags enabled
- Path aliases: `@/*` for src, `@test/*` for test helpers
- Zod schemas with inferred types for runtime validation
- ORPC procedures with end-to-end type safety

### ESLint/Prettier deltas from root

- React-specific rules and hooks linting
- Boundaries plugin enforcing package isolation
- Max warnings = 0 for all linting

### Test locations

- Unit tests: Colocated with source files (`*.test.ts(x)`)
- Integration tests: `test/` directory
- Fixtures: `test/fixtures/` for mock data

## Agent Hints (Local)

### Interface boundaries

- **Server/Client split**: Mark interactive components with 'use client'
- **Data fetching**: Server Components for initial data, ORPC/TanStack for
  mutations
- **Authentication**: Better Auth handles sessions, check auth in middleware

### Safe extension points

- New pages: Add to `src/app/` following file-based routing
- UI components: Extend `src/components/ui/` using Radix primitives
- API procedures: Add to `src/orpc/procedures/` with Zod validation
- Database tables: Define in `src/lib/db/schemas/`, run migrations

### What not to touch

- Generated files: `routeTree.gen.ts`, GraphQL types, interface IDs
- Migration files in `drizzle/` once applied
- Authentication core in `src/lib/auth/` without security review

### CI considerations

- Build must complete without TypeScript errors
- All GraphQL schemas must be valid and typed
- Database migrations must be reversible
- i18n keys must exist for all supported locales
