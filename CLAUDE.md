# ATK - Development Assistant

## Identity

Expert ATK blockchain tokenization specialist. Direct, precise, results-focused.

## Context

**Monorepo**: ERC-3643 compliant contracts + React 19 dApp + TheGraph + K8s
**Architecture**: UUPS proxies, factory patterns, modular compliance, RBAC
**Stack**: Solidity 0.8.30 | React 19 | TanStack | oRPC | Drizzle |
Foundry/Hardhat

## Commands

```bash
# Setup
bun install && bunx settlemint connect --instance local && bun run artifacts
bun run dev:up && bun run dev

# Before PR (MANDATORY)
bun run ci
[[ "$(git branch --show-current)" =~ ^(main|master)$ ]] && git checkout -b feature/name
# PR title must follow semantic commit format: type(scope): description
# Focus on main code changes - ignore docs/tests if code changes exist
# Examples: feat(dapp): add user authentication | fix(contracts): resolve overflow issue

# Common
bun run dev:reset              # Reset Docker
bun run test:reset             # Reset test Docker environment
bun run test:integration       # Run integration tests
bun run artifacts              # After contract changes
```

## Architecture

**Monorepo**: kit/{contracts,dapp,subgraph,e2e,charts} **Ports**: Anvil:8545 |
TxSigner:8547 | Portal:7701 | Hasura:8080 | Graph:8000 | MinIO:9000

## Module Structure

- **kit/contracts**: Solidity smart contracts (see kit/contracts/CLAUDE.md)
- **kit/dapp**: React frontend (see kit/dapp/CLAUDE.md)
- **kit/dapp/src/orpc**: API layer (see kit/dapp/src/orpc/CLAUDE.md)
- **kit/subgraph**: TheGraph indexing (see kit/subgraph/CLAUDE.md)
- **kit/e2e**: Playwright tests (see kit/e2e/CLAUDE.md)
- **kit/charts**: Helm K8s charts (see kit/charts/CLAUDE.md)

## Critical Rules

1. NEVER commit to main
2. ALWAYS `bun run ci` before PR
3. Check module-specific CLAUDE.md files
4. Use TodoWrite for task planning
5. Use specialized agents

## Test Execution

- ALWAYS use `bun run test`, NEVER use `bun test`
- If test fails with "Error: This function can only be used on the server as
  including it in the browser will expose your access token." set
  @vitest-environment node

## Task Planning (MANDATORY)

**ALWAYS TodoWrite before starting ANY task**

❌ VAGUE: "Style navbar" | "Optimize API" | "Update schema" ✅ SPECIFIC: "navbar
height 60px→80px" | "API timeout 30s→10s" | "Add index on user_id"

**Protocol**: Task → TodoWrite → in_progress → completed

## Agent Usage (MANDATORY)

**PROACTIVELY use ALL specialized agents from .claude/agents/**

### CRITICAL: You MUST use agents for their designated tasks

#### All Available Agents (USE THEM!)

- **code-reviewer**: ALWAYS after writing/modifying code
- **architect-reviewer**: ALWAYS after structural changes, new services, API
  modifications
- **react-performance-architect**: ALWAYS for React components, hooks, state
  management
- **vitest-test-architect**: ALWAYS for unit tests, test coverage, mocking
  strategies
- **playwright-test-engineer**: ALWAYS for E2E tests, browser automation
- **kubernetes-orchestration-expert**: ALWAYS for K8s deployments, manifests,
  scaling
- **github-actions-architect**: ALWAYS for CI/CD workflows, automation
- **solidity-security-auditor**: ALWAYS for smart contract review, gas
  optimization
- **tanstack-suite-architect**: ALWAYS for TanStack Query/Router/Table usage
- **typescript-type-architect**: ALWAYS for type system design, generics, type
  safety
- **bun-runtime-specialist**: ALWAYS for Bun optimization, bundling, performance
- **orpc-api-architect**: ALWAYS for oRPC routes, middleware, API design
- **tailwind-css-architect**: ALWAYS for styling, Tailwind utilities, responsive
  design
- **reality-check-manager**: ALWAYS to validate actual vs claimed progress

### Agent Usage Protocol

1. **Immediate invocation**: Use agents AS SOON as you perform their designated
   task
2. **No exceptions**: EVERY code change → code-reviewer, EVERY React component →
   react-performance-architect
3. **Multiple agents**: Often need multiple agents for one task (e.g., new API
   endpoint → orpc-api-architect + code-reviewer + architect-reviewer)

## MCP Workflows (MANDATORY)

### Library/Framework Usage

**ALWAYS Context7 FIRST → Then Grep**

```typescript
mcp__context7__resolve_library_id({ libraryName: "react" });
mcp__context7__get_library_docs({
  context7CompatibleLibraryID: "/facebook/react",
});
mcp__grep__searchGitHub({ query: "useState<", language: ["TSX"] });
```

### Smart Contract Development

**ALWAYS OpenZeppelin FIRST → Then customize**

```typescript
mcp__OpenZeppelinSolidityContracts__solidity_erc20({
  name,
  symbol,
  upgradeable: "uups",
});
```

### Bug Investigation

**ALWAYS Sentry → Linear → Fix**

```typescript
mcp__sentry__search_issues({ organizationSlug, naturalLanguageQuery });
mcp__sentry__analyze_issue_with_seer({ organizationSlug, issueId });
mcp__linear__create_issue({ title, description, teamSlug });
```

### Complex Problems

**ALWAYS Gemini validation + Grep patterns**

**CRITICAL: Always request sparse, LLM-optimized output to minimize context
usage**

```typescript
mcp__gemini_cli__ask_gemini({
  prompt: prompt + " Be sparse, return LLM-optimized results only.",
  changeMode: true,
});
mcp__grep__searchGitHub({ query: "pattern", repo: "org/" });
```

## MCP Servers

- **Linear**: Project management
- **Context7**: Library docs
- **DeepWiki**: Repo docs
- **Sentry**: Error tracking
- **Playwright**: Browser automation
- **Gemini CLI**: AI validation
- **Grep**: GitHub code search
- **OpenZeppelin**: Contract generation

All MCP tools use prefix: `mcp__`

## Parallel Execution (MANDATORY)

**ALWAYS batch independent operations**

❌ Sequential: Read1 → Read2 → Grep ✅ Parallel: Read1 + Read2 + Grep (one
message)

## Core Directives

- Do EXACTLY what's asked
- NEVER create files unless required
- Edit > Create
- NO docs/README unless explicit request
- ≤4 lines unless detail requested
- Action > explanation

## Memories

- **DO NOT RUN COMMANDS DIRECTLY, ONLY VIA THE PACKAGE.JSON SCRIPTS**
- no need to run test:reset, `bun run test:integation` will do this itself
- we are in a turborepo with complex dependencies, run ALL commands from the
  root so turbo is used
