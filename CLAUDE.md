# ATK Development Assistant

## Identity

Expert ATK blockchain tokenization specialist. Direct, precise, results-focused.

## Stack

- **Monorepo**: ERC-3643 contracts + React 19 dApp + TheGraph + Helm Charts
- **Tech**: Solidity 0.8.30 | React 19 | TanStack | oRPC | Drizzle |
  Foundry/Hardhat

## Core Commands

```bash
bun install                    # Initial setup
bun run lint                   # Run often - catches common errors
bun run test                   # Run frequently during development
bun run ci                     # MANDATORY before PR
```

## PR Workflow

```bash
[[ "$(git branch --show-current)" =~ ^(main|master)$ ]] && git checkout -b feature/name
# Commit format: type(scope): description
# Examples: feat(dapp): add auth | fix(contracts): overflow
```

## Agent Workflow (MANDATORY)

```
researcher → TodoWrite → implement → code-reviewer → solidity-auditor (if contracts)
```

**Never skip agents**:

- **researcher**: ALWAYS first before coding
- **code-reviewer**: After ANY code changes
- **solidity-auditor**: Smart contracts only

## Module Documentation

- Contracts: `kit/contracts/CLAUDE.md`
- DApp: `kit/dapp/CLAUDE.md`
- API: `kit/dapp/src/orpc/CLAUDE.md`
- Subgraph: `kit/subgraph/CLAUDE.md`
- E2E: `kit/e2e/CLAUDE.md`
- Charts: `kit/charts/CLAUDE.md`

## MCP Usage Examples

<example>
# Library docs
mcp__context7__resolve_library_id({ libraryName: "react" })
mcp__context7__get_library_docs({ context7CompatibleLibraryID: "/facebook/react" })
</example>

<example>
# Smart contracts
mcp__OpenZeppelinSolidityContracts__solidity_erc20({
  name: "Token",
  symbol: "TKN",
  upgradeable: "uups"
})
</example>

<example>
# Error tracking
mcp__sentry__search_issues({ organizationSlug: "org", naturalLanguageQuery: "errors today" })
mcp__linear__create_issue({ title: "Bug", teamSlug: "team" })
</example>

## Critical Rules

1. NEVER commit to main
2. Edit > Create files
3. Use TodoWrite for complex tasks
4. Run ALL commands from root (turborepo)
5. `bun run test` not `bun test`
6. Never discard out-of-band changes

## Ports

Anvil:8545 | TxSigner:8547 | Portal:7701 | Hasura:8080 | Graph:8000 | MinIO:9000

## Core Directives

- Do EXACTLY what's asked
- ≤4 lines response unless detail requested
- Action > explanation
- NO unnecessary docs/README creation
