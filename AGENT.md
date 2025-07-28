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

**Core Development:**
- **planner**: Tech lead, analyzes requirements, orchestrates teams
- **solidity-expert**: Smart contract development and security
- **react-dev**: React components with TanStack suite
- **orpc-expert**: ORPC API endpoints and OpenAPI
- **subgraph-dev**: TheGraph indexing and mappings

**Quality & Testing:**
- **test-dev**: Vitest and Forge test creation
- **integration-tester**: E2E testing with Playwright
- **security-auditor**: Comprehensive security reviews
- **code-reviewer**: Post-implementation review

**Infrastructure & Optimization:**
- **devops**: Helm charts and Kubernetes configs
- **ci-cd-expert**: GitHub Actions and deployment pipelines
- **performance-optimizer**: Full-stack performance tuning

**Specialized Support:**
- **tailwind-css-expert**: Styling with Tailwind/shadcn
- **doc-architect**: README and CLAUDE.md maintenance
- **content-writer**: Documentation and translations
- **code-archaeologist**: Legacy code analysis
- **team-configurator**: Multi-agent coordination

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
5. **OpenZeppelin Contracts** - Smart contract generation:
   - Quick prototyping with audited base contracts
   - ERC-20/721/1155 tokens, DAOs, stablecoins
   - Use with `solidity-expert` to extend for ATK patterns

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
6. **React hooks**: Avoid unnecessary useCallback/useMemo - see react-dev agent guidelines
7. **React Query with ORPC**:
   ```typescript
   // ✅ CORRECT - Direct usage preserves type safety
   useMutation(orpc.token.create.mutationOptions())
   useQuery(orpc.token.read.queryOptions({ input: { id } }))
   
   // ✅ CORRECT - Custom hooks for reusability
   function useUserTokens(userId?: string) {
     return useQuery(orpc.token.listByUser.queryOptions({
       input: { userId },
       enabled: !!userId, // Dependent query pattern
     }))
   }
   
   // ❌ WRONG - Don't destructure or copy to state
   useMutation({ ...orpc.token.create.mutationOptions() })
   const [tokens, setTokens] = useState(data?.tokens) // Never copy query data
   ```
   - Use `select` for transformations, not render-time filtering
   - Handle loading/error states before checking data
   - Create custom hooks for complex queries
   - Test with MSW and fresh QueryClient per test

## Memories

- Shadcn components are never the problem

## Context Optimization

- Reference README.md files instead of duplicating content
- Keep agent-specific details in agent files
- Use concise command examples
- Avoid redundant explanations
- Link to external docs rather than copying

## Agent Best Practices

1. **Agent File Guidelines**
   - Keep under 500 lines for token efficiency
   - Use bullet points over paragraphs
   - Include only essential examples
   - Reference docs instead of embedding

2. **Agent Selection**
   - Use `planner` for any multi-step implementation
   - Invoke `security-auditor` before production deployments
   - Run `integration-tester` for user-facing features
   - Apply `performance-optimizer` when metrics degrade

3. **Workflow Patterns**
   - **Parallel**: Frontend + Backend development
   - **Sequential**: Contract → Subgraph → API → UI
   - **Continuous**: Security + Performance reviews
   - **Final**: Code review before completion
