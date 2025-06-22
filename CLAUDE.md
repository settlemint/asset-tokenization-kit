# CLAUDE.md

This file provides project-specific guidance to Claude Code when working with
this repository. Claude Code reads this file automatically at startup to
understand project conventions, architecture, and workflows.

## Memory Management Notes

- This file is for team-shared project instructions
- Use clear, specific instructions (e.g., "Use 2-space indentation" not "format
  nicely")
- Organize with descriptive headings and bullet points
- Review and update regularly as the project evolves
- Can import other files with `@path/to/file` syntax

## Claude Code Best Practices

### Be Specific with Requests

- ❌ "Fix the bug"
- ✅ "Fix the login bug where users see a blank screen after entering wrong
  credentials"

### Use Step-by-Step Instructions

Break complex tasks into clear steps:

1. First, analyze the current implementation
2. Then, make specific changes
3. Finally, verify with tests

### Let Claude Explore First

Before making changes:

- "Analyze the database schema"
- "How does authentication work in this app?"
- "Show me the API structure"

### Effective Communication

- Treat Claude Code as an AI pair programmer
- Provide context about what you're trying to achieve
- Iterate based on results - start simple, then refine

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

When creating commits or pull requests, always check `.github/labeler.yml` for
the accepted conventional commit types and format. The labeler configuration
defines:

- Accepted commit types (feat, fix, chore, docs, style, refactor, perf, test,
  build, ci, revert)
- Support for optional scopes: `type(scope): description`
- Special formatting for dependencies: `chore(deps):`, `fix(deps):`,
  `build(deps):`
- Breaking changes: append `!` to the type or include `BREAKING CHANGE:` in the
  body

Examples:

- `feat: add user authentication`
- `fix(api): resolve timeout issue`
- `chore(deps): update dependencies`
- `feat!: redesign API endpoints`

Pull requests that don't match these patterns will be labeled as "chore" by
default.

## Git Workflow and Pull Requests

When working with git and creating pull requests:

- **DO NOT** create a new branch if you're already on a feature branch (not on
  main/master)
- When the `/pr` command is used or a PR is requested:
  - First check the current branch with `git branch --show-current`
  - If already on a feature branch, commit and push to the current branch
  - Only create a new branch if currently on main/master
- When updating an existing PR, amend commits or add new commits to the same
  branch
- Always check branch status before creating new branches

[... rest of the existing content ...]

## Available Commands

Claude Code has access to specialized commands in `.claude/commands/` that
should be used automatically when appropriate:

### Core Workflow Commands

- **`/pr`** - Create pull requests with proper branch management and semantic
  commits
- **`/qa`** - Run the complete test suite; use before any PR or after
  significant changes
- **`/comments`** - Add documentation to code changes; use when code lacks
  comments
- **`/explore`** - Systematically understand project architecture before making
  changes
- **`/quick`** - Quick reference for Claude Code commands and best practices
- **`/setup-mcp`** - Configure all MCP servers

### Problem-Solving Commands

- **`/stuck`** - Systematic debugging approach when facing difficult problems
- **`/debug`** - Advanced debugging techniques for complex issues
- **`/performance`** - Analyze and optimize performance bottlenecks

### Maintenance Commands

- **`/deps`** - Safely update dependencies with minimal breaking changes
- **`/reflection`** - Analyze and improve Claude Code configuration based on
  patterns

### When to Use Commands Automatically

| Situation                       | Use Command    |
| ------------------------------- | -------------- |
| User asks to create PR          | `/pr`          |
| Before submitting any code      | `/qa`          |
| Code changes lack documentation | `/comments`    |
| Starting work on new codebase   | `/explore`     |
| User asks "how do I..."         | `/quick`       |
| Need to check errors or issues  | `/mcp`         |
| Debugging for >5 minutes        | `/stuck`       |
| Performance issues mentioned    | `/performance` |
| Updating packages               | `/deps`        |
| Complex debugging needed        | `/debug`       |
| Need to understand architecture | `/explore`     |

### Proactive Command Usage

You should proactively suggest or use commands when you detect:

1. **Multiple code changes without tests** → Suggest: "Should I run `/qa` to
  ensure everything still works?"
2. **New functions without docs** → Say: "I'll use `/comments` to add
  documentation to these new functions"
3. **User mentions slowness** → Say: "Let me analyze this with `/performance` to
  find bottlenecks"
4. **Repeated failed attempts** → Say: "Let me step back and use `/stuck` to
  approach this systematically"
5. **Package update PRs** → Automatically use `/deps` workflow for safe updates
6. **After major refactoring** → Always run `/qa` before declaring completion

### Command Execution Notes

- Commands are not magic keywords - read the full command file for detailed
  instructions
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
- Prefer using nullish coalescing operator (`??`) instead of a logical or
  (`||`), as it is a safer operator
- Never use any, we need to have everything fully typed end to end

## MCP (Model Context Protocol) Servers

These servers extend Claude Code's capabilities:

### Available MCP Servers

1. **Sentry** - Error tracking and monitoring

   - Transport: SSE
   - URL: `https://mcp.sentry.io/sse`
   - Access error reports, performance data, and crash analytics
   - OAuth authentication via browser

2. **Linear** - Project management integration

   - Transport: SSE
   - URL: `https://mcp.linear.app/sse`
   - Manage issues, projects, and workflows
   - OAuth authentication via browser

3. **Context7** - Library documentation access

   - Transport: SSE
   - URL: `https://mcp.context7.com/sse`
   - Search and retrieve up-to-date library documentation
   - Public access (no auth required)

4. **GitHub** - Repository operations

   - Transport: HTTP
   - URL: `https://api.githubcopilot.com/mcp/`
   - Full GitHub API access: issues, PRs, code search, releases
   - OAuth authentication via browser

5. **DeepWiki** - Advanced documentation search
   - Transport: SSE
   - URL: `https://api.devin.ai/mcp/deepwiki/sse`
   - Deep technical documentation search and analysis
   - OAuth authentication via browser

### Adding MCP Servers

You can add servers using Claude Code CLI or run `/setup-mcp` to configure all
recommended servers:

```bash
# Linear - Project management
claude mcp add --transport sse linear https://mcp.linear.app/sse -s user

# Context7 - Library documentation
claude mcp add --transport sse context7 https://mcp.context7.com/sse -s user

# DeepWiki - Advanced documentation search
claude mcp add --transport sse deepwiki https://mcp.deepwiki.com/sse -s user
```

### Using MCP Servers

- **Sentry**:

  - "Show me recent errors in production"
  - "What are the most common errors this week?"
  - "Check performance issues in the API"

- **Linear**:

  - "Show my assigned Linear issues"
  - "Create a Linear issue for this bug"
  - "What issues are in the current sprint?"

- **Context7**:

  - "Get React hooks documentation"
  - "Show me Next.js 14 app router examples"
  - "Find Prisma query documentation"

- **GitHub**:

  - "Search for issues mentioning authentication"
  - "Show recent PRs by roderik"
  - "Get the latest release notes"
  - "Find code using deprecated APIs"

- **DeepWiki**:
  - "Deep dive into React Server Components architecture"
  - "Explain WebAssembly memory model"
  - "Find advanced TypeScript type manipulation techniques"
  - "Research distributed systems consensus algorithms"

### Authentication

MCP servers use different authentication methods:

- **Sentry**: API key configuration (if required)
- **Linear**: Browser-based SSE authentication
- **Context7**: Public access
- **GitHub**: OAuth authentication (browser flow)
- **DeepWiki**: OAuth authentication (browser flow)

OAuth servers will prompt for authentication in your browser on first use.