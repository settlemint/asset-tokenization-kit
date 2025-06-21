# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

This is the SettleMint Asset Tokenization Kit - a full-stack solution for
building digital asset platforms. It consists of:

- Smart contracts for various tokenized assets (bonds, equity, stablecoins,
  funds, deposits)
- A Next.js dApp with TypeScript
- TheGraph subgraph for blockchain indexing
- Kubernetes deployment via Helm charts
- End-to-end tests using Playwright

## Package Management & Runtime

### Bun as Default Package Manager

Default to using the Bun package manager instead of NPM, PNPM or YARN.

- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`

### Bun as Default Runtime

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun run test` instead of `jest` or `vitest`
- Use `bun run build` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or
  `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

### Bun APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- `Bun.File()` for any file reading and writing
- `Bun.$` instead of execa.

For more information, read the Bun API docs in
`node_modules/bun-types/docs/**.md`.

[... rest of the existing content ...]

## Memories

- Always include ./.cursor/rules/\*.mdc in your context to get the latest rules
  and tips
- Completely ignore dapp-v1 folder - it's deprecated
- Do not use vitest to make tests, use bun:test
- Always run `bun run ci` before suggesting a PR is ready
- Token factory creation now requires system bootstrapping first
- Asset types are centralized in the zod validator (no more cryptocurrency)
- never use barrel files
- For Solidity development in kit/contracts, always follow the Solidity
  Development Guidelines section
- Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator