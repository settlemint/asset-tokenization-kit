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

# Common
bun run dev:reset              # Reset Docker
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

## Task Planning (MANDATORY)

**ALWAYS TodoWrite before starting ANY task**

❌ VAGUE: "Style navbar" | "Optimize API" | "Update schema" ✅ SPECIFIC: "navbar
height 60px→80px" | "API timeout 30s→10s" | "Add index on user_id"

**Protocol**: Task → TodoWrite → in_progress → completed

## Agent Usage (MANDATORY)

**PROACTIVELY use specialized agents**

### Categories

- **Development**: code-reviewer, architect-reviewer,
  react-performance-architect
- **Testing**: vitest-test-architect, playwright-test-engineer
- **Infrastructure**: kubernetes-orchestration-expert, github-actions-architect
- **Specialized**: solidity-security-auditor, tanstack-suite-architect

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

```typescript
mcp__gemini_cli__ask_gemini({ prompt, changeMode: true });
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
