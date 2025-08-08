# Repository Guidelines

## Project Structure & Module Organization
- Monorepo root uses Turborepo. Workspaces live under `kit/*`.
- `kit/contracts`: ERC‑3643 Solidity (Foundry/Hardhat); tests in `test/`.
- `kit/dapp`: React 19 app (TanStack, Drizzle, oRPC); tests in `test/`, static assets in `public/`.
- `kit/subgraph`: TheGraph subgraph (AssemblyScript); sources in `src/`, artifacts in `build/`.
- `kit/charts`: Helm charts for deployment.
- `kit/e2e`: Playwright UI/API tests and helpers.

## Build, Test, and Development Commands
- Install: `bun install`
- Lint: `bun run lint` — runs linters across all workspaces.
- Test: `bun run test` — unit tests (Foundry, Vitest, subgraph).
- CI suite: `bun run ci` — compile, codegen, lint, test, typecheck, build, artifacts.
- Dev: `bun run dev` — starts watch processes (dApp + tools). Run from repo root.
- E2E: `bun run test:e2e:ui` / `bun run test:e2e:api` (from root).

## Coding Style & Naming Conventions
- TypeScript/React: Prettier (2‑space indent), ESLint (`kit/dapp/eslint.config.mjs`).
- Solidity: `solc 0.8.30`, Foundry fmt (4‑space indent), `solhint` (`kit/contracts/.solhint.json`).
- Filenames: kebab‑case for files, PascalCase for React components, camelCase for variables/functions.
- Keep modules small; colocate tests in nearest `test/` directory.

## Testing Guidelines
- Contracts: Foundry (`forge test` via `bun run test`), gas/coverage enabled; place tests in `kit/contracts/test`.
- dApp: Vitest + Testing Library; place tests in `kit/dapp/test` and `src/**/__tests__` when co‑located.
- Subgraph: unit tests in `kit/subgraph/test`; rebuild with `bun run build` before running.
- E2E: Playwright configs in `kit/e2e`; prefer data‑setup via API utilities.

## Commit & Pull Request Guidelines
- Branching: never commit to `main`; create feature branches: `feature/<short-scope>`.
- Commits: `type(scope): description` (e.g., `feat(dapp): add auth`, `fix(contracts): overflow`).
- PRs: include purpose, linked issues, screenshots/logs, and note breaking changes. Must pass `bun run ci`.

## Security & Configuration Tips
- Manage secrets via `.env.local` (never commit secrets). Use provided `.env` templates.
- Run all commands from repo root; do not modify generated files under `.generated/`.
