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

1. **ALWAYS use researcher agent FIRST before ANY coding**
2. NEVER commit to main
3. ALWAYS `bun run ci` before PR
4. Check module-specific CLAUDE.md files
5. Use TodoWrite for task planning
6. Use ALL specialized agents in correct order

## Test Execution (MANDATORY test-validator agent)

- ALWAYS use `bun run test`, NEVER use `bun test`
- **MANDATORY**: MUST use test-validator agent for ALL test runs (especially
  integration tests)
- **CRITICAL**: When running `bun run test:integration`, ALWAYS use
  test-validator agent
- If test fails with "Error: This function can only be used on the server as
  including it in the browser will expose your access token." set
  @vitest-environment node

## Task Planning (MANDATORY)

**WORKFLOW: researcher agent → TodoWrite → implementation → validation agents**

**ALWAYS use researcher agent FIRST, then TodoWrite based on research**

❌ VAGUE: "Style navbar" | "Optimize API" | "Update schema" ✅ SPECIFIC: "navbar
height 60px→80px" | "API timeout 30s→10s" | "Add index on user_id"

**Protocol**: Task → TodoWrite → in_progress → completed

## 🚨 CRITICAL: Agent Usage is MANDATORY (NOT OPTIONAL) 🚨

**⚠️ WARNING: Failure to use agents in the correct order will result in:**

- **Duplicated work and wasted effort**
- **Incorrect implementations that need rework**
- **Missing critical patterns and best practices**
- **Security vulnerabilities and performance issues**

## Agent Orchestration (MANDATORY WORKFLOW)

**Available Agents (4 total) - USE IN THIS EXACT ORDER:**

1. **researcher** (🔴 ALWAYS FIRST - NO EXCEPTIONS):
   - **MANDATORY before writing ANY code**
   - Fetches ALL relevant documentation
   - Finds existing patterns to avoid duplication
   - Creates implementation plan based on best practices
   - **SKIP THIS = GUARANTEED REWORK**

2. **code-reviewer** (MANDATORY after ANY code changes):
   - Validates quality, architecture, SOLID principles
   - Checks implementation correctness
   - Identifies security issues and performance problems
   - **SKIP THIS = TECHNICAL DEBT**

3. **solidity-auditor** (MANDATORY for smart contracts):
   - Security audits and vulnerability detection
   - Gas optimization analysis
   - ERC compliance verification
   - **SKIP THIS = SECURITY RISKS**

4. **test-validator** (MANDATORY for ALL tests & linting):
   - Runs ALL test types in parallel
   - Executes linters and formatters
   - **NEVER run tests/lint directly - ALWAYS use this agent**

### 🎯 THE ONLY ACCEPTABLE WORKFLOW (NO DEVIATIONS)

```typescript
// ⚡ STEP 1: RESEARCH (NON-NEGOTIABLE - ALWAYS FIRST)
researcher agent → gathers ALL docs, patterns, best practices
  ↓
// 📝 STEP 2: IMPLEMENTATION (based on research output)
You write code ONLY after researcher provides guidance
  ↓
// ✅ STEP 3: VALIDATION (parallel execution)
code-reviewer & test-validator → run simultaneously
  ↓
// 🔒 STEP 4: SPECIALIZED (when applicable)
solidity-auditor → for smart contract changes

// 🚫 FORBIDDEN ACTIONS:
// ❌ Writing code without researcher agent
// ❌ Running tests without test-validator agent
// ❌ Running lint without test-validator agent
// ❌ Claiming completion without code-reviewer agent
// ❌ Deploying contracts without solidity-auditor agent

// ✅ CORRECT EXAMPLES:
// User: "Add user authentication"
// You: Use researcher agent FIRST → then implement → then validate

// User: "Fix the bug in token transfer"
// You: Use researcher agent FIRST → understand patterns → fix → validate
```

### 🔴 MANDATORY Agent Usage Rules

**researcher** (🚨 ALWAYS FIRST - NO EXCEPTIONS):

- **BEFORE writing ANY code (even 1 line)**
- **BEFORE ANY implementation task**
- **BEFORE modifying existing code**
- **BEFORE adding new features**
- **BEFORE fixing bugs**
- **BEFORE refactoring**
- **Even for "simple" tasks - NO EXCEPTIONS**

**Why researcher MUST be first:**

- Prevents reinventing existing solutions
- Ensures correct patterns are used
- Identifies the right approach immediately
- Saves hours of rework

**code-reviewer** (AFTER CODING):

- After ANY code changes
- Before ANY pull request
- When claiming task complete
- To validate implementation

**test-validator** (MANDATORY for tests):

- **MANDATORY**: When user asks to run ANY tests (unit, integration, e2e)
- **MANDATORY**: For `bun run test:integration` command
- After code changes
- Before commits
- Before PR creation
- To debug test failures
- **NEVER** run tests directly - ALWAYS through test-validator agent

**solidity-auditor** (CONTRACTS ONLY):

- After contract modifications
- For gas optimization
- For security review
- For ERC compliance

### Development Expertise Location

- **React/Frontend**: kit/dapp/CLAUDE.md
- **Solidity**: kit/contracts/CLAUDE.md
- **Testing**: kit/dapp/CLAUDE.md
- **K8s/Infrastructure**: kit/charts/CLAUDE.md
- **API**: kit/dapp/src/orpc/CLAUDE.md

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
- NEVER run test:reset manually! test:integration will handle it
