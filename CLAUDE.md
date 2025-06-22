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

## Commit Messages and PR Titles

When creating commits or pull requests, always check `.github/labeler.yml` for the accepted conventional commit types and format. The labeler configuration defines:

- Accepted commit types (feat, fix, chore, docs, style, refactor, perf, test, build, ci, revert)
- Support for optional scopes: `type(scope): description`
- Special formatting for dependencies: `chore(deps):`, `fix(deps):`, `build(deps):`
- Breaking changes: append `!` to the type or include `BREAKING CHANGE:` in the body

Examples:
- `feat: add user authentication`
- `fix(api): resolve timeout issue`
- `chore(deps): update dependencies`
- `feat!: redesign API endpoints`

Pull requests that don't match these patterns will be labeled as "chore" by default.

## Git Workflow and Pull Requests

When working with git and creating pull requests:

- **DO NOT** create a new branch if you're already on a feature branch (not on main/master)
- When the `/pr` command is used or a PR is requested:
  - First check the current branch with `git branch --show-current`
  - If already on a feature branch, commit and push to the current branch
  - Only create a new branch if currently on main/master
- When updating an existing PR, amend commits or add new commits to the same branch
- Always check branch status before creating new branches

[... rest of the existing content ...]

## Available Commands

Claude Code has access to specialized commands in `.claude/commands/` that should be used automatically when appropriate:

### Core Workflow Commands
- **`/pr`** - Create pull requests with proper branch management and semantic commits
- **`/qa`** - Run the complete test suite; use before any PR or after significant changes
- **`/comments`** - Add documentation to code changes; use when code lacks comments

### Problem-Solving Commands
- **`/stuck`** - Systematic debugging approach when facing difficult problems
- **`/debug`** - Advanced debugging techniques for complex issues
- **`/performance`** - Analyze and optimize performance bottlenecks

### Maintenance Commands
- **`/deps`** - Safely update dependencies with minimal breaking changes
- **`/reflection`** - Analyze and improve Claude Code configuration based on patterns

### When to Use Commands Automatically

| Situation | Use Command |
|-----------|-------------|
| User asks to create PR | `/pr` |
| Before submitting any code | `/qa` |
| Code changes lack documentation | `/comments` |
| Debugging for >5 minutes | `/stuck` |
| Performance issues mentioned | `/performance` |
| Updating packages | `/deps` |
| Complex debugging needed | `/debug` |

### Proactive Command Usage

You should proactively suggest or use commands when you detect:

1. **Multiple code changes without tests** → Suggest: "Should I run `/qa` to ensure everything still works?"
2. **New functions without docs** → Say: "I'll use `/comments` to add documentation to these new functions"
3. **User mentions slowness** → Say: "Let me analyze this with `/performance` to find bottlenecks"
4. **Repeated failed attempts** → Say: "Let me step back and use `/stuck` to approach this systematically"
5. **Package update PRs** → Automatically use `/deps` workflow for safe updates
6. **After major refactoring** → Always run `/qa` before declaring completion

### Command Execution Notes

- Commands are not magic keywords - read the full command file for detailed instructions
- Each command is a comprehensive workflow guide, not a single action
- Follow the command steps systematically for best results
- Commands can be combined (e.g., `/deps` followed by `/qa`)

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