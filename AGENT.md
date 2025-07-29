# Asset Tokenization Kit

**SettleMint Asset Tokenization Kit** - Full-stack blockchain tokenization
platform.

## Quick Reference

```bash
# Setup
bun install && bunx settlemint connect --instance local && bun run artifacts

# Development
bun run dev:up && bun run dev

# Quality (REQUIRED before PR)
bun run ci

# Branch check (CRITICAL)
[[ "$(git branch --show-current)" =~ ^(main|master)$ ]] && git checkout -b feature/name
```

## Project Structure

- `kit/contracts/` - Solidity (ERC-3643, UUPS) → Use **solidity-expert**
- `kit/dapp/` - React 19, TanStack, ORPC → Use **react-dev**
- `kit/subgraph/` - TheGraph indexing → Use **subgraph-dev**
- `kit/dapp/src/orpc/` - API endpoints → Use **orpc-expert**

## Agent Orchestration Pattern

### CRITICAL: Agent Routing Protocol

**For any implementation task:**

1. **ALWAYS start with planner** agent for multi-step features
2. **FOLLOW the agent routing** specified by planner EXACTLY
3. **USE ONLY the agents** explicitly recommended
4. **NEVER substitute agents** unless specified as fallback

### Available Specialized Agents

- **planner**: Analyzes requirements, creates implementation plans
- **solidity-expert**: Smart contract development and security
- **react-dev**: React components with TanStack suite
- **orpc-expert**: ORPC API endpoints and OpenAPI
- **subgraph-dev**: TheGraph indexing and mappings
- **test-dev**: Vitest and Forge test creation
- **doc-architect**: README and CLAUDE.md maintenance
- **devops**: Helm charts and Kubernetes configs
- **content-writer**: Documentation and translations
- **code-reviewer**: Post-implementation review

### Example: Implementing a Feature

```
User: "Add token transfer functionality with approval"

Correct Flow:
1. Use planner agent to analyze and create plan
2. Follow planner's agent routing map:
   - solidity-expert for contract implementation
   - react-dev for UI components
   - test-dev for test coverage
3. Use code-reviewer after implementation
```

## Essential Commands

See `package.json` scripts. Key ones:

- `bun run artifacts` - After contract changes
- `bun run dev:reset` - Reset Docker environment
- `bun run db:generate && bun run db:migrate` - Database changes

## MCP Tools (Strategic Usage)

1. **Gemini-CLI** - Use ONLY for:
   - Second opinions on critical architectural decisions
   - Validation when stuck on complex problems
   - Quick sanity checks with `gemini-2.5-pro`
   - NOT for initial analysis (use Opus's built-in understanding first)
2. **Context7** - Latest library docs
3. **Grep** - Real-world examples
4. **Linear/Sentry** - Issue tracking

## CLAUDE.md Creation Rules

Module CLAUDE.md files MUST be minimal (< 50 lines):

```markdown
# [Module] - AI Guidelines

[One-line description]. See [README.md](./README.md) for documentation.

**Agent**: Use `[agent-name]` for this module.

[Only critical AI-specific notes if needed]
```

## Critical Rules

1. **NEVER commit to main branch**
2. **ALWAYS run `bun run ci` before PR**
3. **Trust Opus first, validate with Gemini-CLI only when needed**
4. **NEVER modify shadcn components in ui/ folder**
5. **Subgraph .ts files are AssemblyScript, not TypeScript**

## Memories

- Shadcn components are never the problem

## Context Optimization

- Reference README.md files instead of duplicating content
- Keep agent-specific details in agent files
- Use concise command examples
- Avoid redundant explanations
- Link to external docs rather than copying
