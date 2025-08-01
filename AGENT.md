# Asset Tokenization Kit (ATK) - Development Assistant

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
bun run db:generate && migrate # DB changes
cd kit/dapp && bun run codegen # Frontend codegen
cd kit/contracts && bun test   # Test contracts
```

## Architecture

**Monorepo**: kit/{contracts,dapp,subgraph,e2e,charts,tools}

**Contracts**:

- System: ATKSystem (registry), AccessManager (RBAC), UUPS proxies
- Assets: Bonds, Deposits, Equities, Funds, Stablecoins, Crypto
- SMART: Modular compliance (Burnable, Capped, Collateral, Pausable, Yield)

**Frontend**: React 19 + TanStack (Query/Router/Form/Start) + oRPC + Drizzle +
shadcn/ui

**Ports**: Anvil:8545 | TxSigner:8547 | Portal:7701 | Hasura:8080 | Graph:8000 |
MinIO:9000

## Critical Rules

1. NEVER commit to main
2. ALWAYS `bun run ci` before PR
3. vitest only (not bun:test)
4. Trust Opus → validate with Gemini
5. NEVER modify shadcn ui/ components
6. Subgraph = AssemblyScript (not TypeScript)
7. No unnecessary useCallback/useMemo
8. React Query + oRPC:

```typescript
// ✅ CORRECT
useMutation(orpc.token.create.mutationOptions());
useQuery(orpc.token.read.queryOptions({ input: { id } }));

// ❌ WRONG
useMutation({ ...orpc.token.create.mutationOptions() });
const [tokens, setTokens] = useState(data?.tokens); // Never copy query data
```

## Key Facts

- Shadcn components = never the problem
- vitest only (not bun:test)
- `select` for transforms (not render-time)
- Handle loading/error before data

## Testing

- **Contracts**: Foundry tests in kit/contracts/test/
- **Frontend**: Vitest with `bun run test`
- **E2E**: Playwright in kit/e2e/

```bash
forge test --match-test testSpecificFunction -vvv  # Single contract test
bun run test path/to/test.spec.ts                  # Single frontend test
```

## Patterns

**Upgradeable Contracts**: Never change storage layout | Add vars at end | Use
gap pattern

**Type Safety**: ABIs → Contract types | Schemas → GraphQL types | Drizzle → DB
types | Run `bun run codegen` after changes

## Debugging

- **Contracts**: docker logs atk-anvil | forge debug | Check
  ignition/deployments/
- **Frontend**: Console + Network tab | Check localStorage auth
- **Subgraph**: docker logs atk-graph-node | http://localhost:8030/graphql

## Kit Packages

**kit/contracts**:

- Stack: Foundry + Hardhat + Solidity 0.8.30 + OpenZeppelin 5.4.0 + OnChainID
  v2.2.1
- Patterns: UUPS proxies, Factory pattern, Modular compliance, RBAC via
  AccessManager

**kit/dapp**:

- Stack: React 19 + TanStack (Start/Query/Form/Router) + oRPC + Drizzle + Better
  Auth
- UI: Tailwind v4 + shadcn/ui + Vite + Bun runtime
- Features: Multi-step wizards, URL state, 2FA/pincode, i18next, Recharts

**kit/subgraph**:

- Stack: TheGraph v0.38.1 + AssemblyScript + GraphQL + gql.tada
- Coverage: System/Token/Compliance/Identity/Asset events

**kit/e2e**:

- Stack: Playwright v1.54.1 + TypeScript + Page Object Model
- Coverage: Onboarding, Asset ops, Token ops, XvP, Form validation

**kit/charts**:

- Stack: Helm v3 + K8s + Victoria Metrics + Tempo
- Services: ATK chart, PostgreSQL, Redis, Besu, Portal, Hasura
- Features: HPA, Network policies, PodDisruptionBudgets

## Task Planning (MANDATORY)

**ALWAYS TodoWrite before starting ANY task**

❌ VAGUE: "Style navbar" | "Optimize API" | "Update schema"
✅ SPECIFIC: "navbar height 60px→80px" | "API timeout 30s→10s" | "Add index on
user_id"

**Protocol**: Task → TodoWrite → in_progress → completed → update if needed

## Agent Usage (MANDATORY)

**PROACTIVELY use specialized agents from `.claude/agents/`**

NEVER handle specialized tasks yourself → ALWAYS use the appropriate agent

### Agent Categories

**Development & Architecture**

- `code-reviewer` - MUST BE USED after ANY code changes
- `architect-reviewer` - MUST BE USED for architectural decisions
- `react-performance-architect` - MUST BE USED for React components
- `typescript-type-architect` - MUST BE USED for TypeScript types
- `orpc-api-architect` - MUST BE USED for oRPC APIs
- `tailwind-css-architect` - MUST BE USED for styling

**Testing**

- `vitest-test-architect` - MUST BE USED for unit tests
- `playwright-test-engineer` - MUST BE USED for E2E tests

**Infrastructure**

- `kubernetes-orchestration-expert` - MUST BE USED for K8s tasks
- `github-actions-architect` - MUST BE USED for CI/CD workflows
- `bun-runtime-specialist` - MUST BE USED for Bun optimization

**Specialized**

- `solidity-security-auditor` - MUST BE USED for smart contracts
- `tanstack-suite-architect` - MUST BE USED for TanStack libraries
- `reality-check-manager` - MUST BE USED to verify completions

### Agent Usage Examples

```typescript
// After writing React component
Task({
  subagent_type: "react-performance-architect",
  description: "Review component",
  prompt: "Review and optimize the new Dashboard component",
});

// After modifying API
Task({
  subagent_type: "code-reviewer",
  description: "Review API changes",
  prompt: "Review the updated user endpoints for security and quality",
});

// When creating tests
Task({
  subagent_type: "vitest-test-architect",
  description: "Create unit tests",
  prompt: "Create comprehensive tests for the auth module",
});
```

**REMEMBER**: Using specialized agents is NOT optional - it's MANDATORY for
quality and consistency.

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

### MCP Workflows

- Library use → Context7 + Grep
- Contracts → OpenZeppelin first
- Bugs → Sentry + Linear
- Complex → Gemini + Grep
- Frontend → Context7 + Grep
- Breaking changes → Linear + Sentry + DeepWiki + Gemini
- E2E → Playwright MCP

### MCP Examples

```typescript
// Linear
mcp__linear__list_issues({ includeArchived: false, limit: 50 });
mcp__linear__create_issue({ title, description, teamSlug });

// Context7 (ALWAYS before libraries)
mcp__context7__resolve_library_id({ libraryName: "react" });
mcp__context7__get_library_docs({
  context7CompatibleLibraryID: "/facebook/react",
  topic: "hooks",
});

// Sentry
mcp__sentry__search_issues({ organizationSlug, naturalLanguageQuery });
mcp__sentry__analyze_issue_with_seer({ organizationSlug, issueId });

// Gemini CLI
mcp__gemini_cli__ask_gemini({ prompt, changeMode: true, sandbox: true });

// Grep
mcp__grep__searchGitHub({
  query: "useState(",
  language: ["TypeScript", "TSX"],
});

// OpenZeppelin
mcp__OpenZeppelinSolidityContracts__solidity_erc20({
  name,
  symbol,
  mintable,
  upgradeable: "uups",
});
```

## Parallel Execution (MANDATORY)

**ALWAYS batch independent operations in ONE message**

❌ Sequential: Read1 → Read2 → Grep
✅ Parallel: Read1 + Read2 + Grep (one message)

**Patterns**: Files | Searches | Tests | Code Gen | Analysis → ALL PARALLEL

## Optimizations

- ≤4 lines unless detail requested
- ALWAYS batch parallel operations
- Action > explanation
- Concise, technical language
- Opus → Gemini validation
- Concurrent > sequential

## Core Directives

- Do EXACTLY what's asked (no more, no less)
- NEVER create files unless required
- Edit > Create
- NO docs/README unless explicit request
