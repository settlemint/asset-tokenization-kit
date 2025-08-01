# ATK - Asset Tokenization Kit

Full-stack blockchain tokenization platform (ERC-3643, UUPS).

## Setup & Commands

```bash
bun install && bunx settlemint connect --instance local && bun run artifacts
bun run dev:up && bun run dev  # Development
bun run ci                      # REQUIRED before PR
[[ "$(git branch --show-current)" =~ ^(main|master)$ ]] && git checkout -b feature/name  # Branch check
```

## Structure → Agent Mapping

- `kit/contracts/` → **solidity-expert** (Opus)
- `kit/dapp/` → **react-dev** (Sonnet)
- `kit/dapp/src/orpc/` → **orpc-expert** (Sonnet)
- `kit/subgraph/` → **subgraph-dev** (Sonnet)

## Agent Orchestration

### Execution Flow

1. **ALWAYS start with planner** for multi-step features
2. Check @.claude/orchestration/agent-dependencies.yaml for parallelization
3. Use workflows: `feature-development.yaml`, `bug-fix.yaml`
4. Maintain shared context & caching
5. Select model: Opus (security/complex) vs Sonnet (patterns/speed)

### Agent Return Format (Compressed)

```yaml
s: ✓ # status: ✓/⚠/✗
f: ["/path/file.ts:+45-12"] # files: path:+added-removed
n: ["orpc-expert:api"] # next: agent:context
c: ["gemini:abc123"] # cache keys
```

### Available Agents

**Core** (Model):

- planner (O): Requirements analysis, orchestration
- solidity-expert (O): Smart contracts, security
- react-dev (S): React 19, TanStack suite
- orpc-expert (S): API endpoints, OpenAPI
- subgraph-dev (S): TheGraph indexing
- database-expert (S): PostgreSQL/Drizzle
- typescript-expert (S): Advanced types

**Quality**:

- test-dev (S): Vitest/Forge tests
- integration-tester (S): E2E Playwright
- security-auditor (O): Full-stack security
- code-reviewer (S): Post-implementation

**Infra/Support**:

- devops: Helm/K8s
- ci-cd-expert: GitHub Actions
- performance-optimizer: Full-stack perf
- config-expert: Env/secrets
- tailwind-css-expert: Styling
- documentation-expert: README.md only
- code-archaeologist: Legacy analysis
- team-configurator: Multi-agent coord

### Parallel Execution Phases

1. **Analysis**: planner, archaeologist, security (parallel)
2. **Foundation**: solidity, database, typescript (parallel)
3. **Integration**: subgraph → orpc → react (sequential)
4. **Quality**: tests, perf, docs (parallel)
5. **Review**: code-reviewer (final)

### Workflow Example (Feature)

```yaml
"Add token transfer with approval":
  1. Analysis: planner+security+perf (parallel, Opus)
  2. Design: types+db+config (parallel, Sonnet)
  3. Implementation: contract→subgraph→api→ui
  4. Quality: tests+docs (parallel)
  5. Review: final check
```

### Context Handoff

```typescript
// Phase output
{contractAddresses: {token: '0x...'}, caches: {gemini: 'id123'}}
// Next phase input
"Index events at ${contractAddresses}, use cache ${caches.gemini}"
```

## Model Selection

**Opus**: Security, architecture, complex analysis **Sonnet**: Patterns,
standard impl, parallel tasks

Auto-select: security/auth→Opus, simple/urgent→Sonnet, analysis→Opus

## Commands

- `bun run artifacts` - After contract changes
- `bun run dev:reset` - Reset Docker env
- `bun run db:generate && bun run db:migrate` - DB changes

## MCP Tools

**Gemini-CLI** (REQUIRED):

1. Before: `@file.ts explain architecture`
2. After: `@file.ts review for bugs` (changeMode:true)
3. Complex: Architecture validation, perf analysis

**Context7**: Cache library docs (1hr) **Grep**: Real examples (24hr cache)
**OpenZeppelin**: Smart contract templates

## CLAUDE.md Creation Rules

Module CLAUDE.md files MUST be minimal (< 50 lines):

```markdown
# [Module] - AI Guidelines

[One-line description]. See [README.md](./README.md) for documentation.

**Agent**: Use `[agent-name]` for this module.

[Only critical AI-specific notes if needed]
```

## Documentation Rules

1. **ALWAYS write documentation in README.md files** in the relevant module
   folders
2. **NEVER create separate docs/ folders** - documentation belongs with the code
3. **Module structure for documentation**:
   - `kit/contracts/README.md` - Smart contract documentation
   - `kit/dapp/README.md` - Frontend documentation
   - `kit/dapp/src/orpc/README.md` - API documentation
   - `kit/subgraph/README.md` - Subgraph documentation
4. **Documentation content**:
   - User guides go in module README.md files
   - API references go in relevant folder README.md files
   - Architecture docs go in root or module README.md files

## Critical Rules

1. **NEVER commit to main branch**
2. **ALWAYS run `bun run ci` before PR**
3. **ALWAYS use vitest, not bun:test**
4. **Trust Opus first, validate with Gemini-CLI**
5. **NEVER modify shadcn components in ui/ folder**
6. **Subgraph .ts files are AssemblyScript, not TypeScript**
7. **React hooks**: Avoid unnecessary useCallback/useMemo - see react-dev agent
   guidelines
8. **React Query with ORPC**:

   ```typescript
   // ✅ CORRECT - Direct usage preserves type safety
   useMutation(orpc.token.create.mutationOptions());
   useQuery(orpc.token.read.queryOptions({ input: { id } }));

   // ✅ CORRECT - Custom hooks for reusability
   function useUserTokens(userId?: string) {
     return useQuery(
       orpc.token.listByUser.queryOptions({
         input: { userId },
         enabled: !!userId, // Dependent query pattern
       })
     );
   }

   // ❌ WRONG - Don't destructure or copy to state
   useMutation({ ...orpc.token.create.mutationOptions() });
   const [tokens, setTokens] = useState(data?.tokens); // Never copy query data
   ```

   - Use `select` for transformations, not render-time filtering
   - Handle loading/error states before checking data
   - Create custom hooks for complex queries
   - Test with MSW and fresh QueryClient per test

## Memories

- Shadcn components are never the problem
- We use vitest, not bun:test

## Context Optimization

- Reference README.md files instead of duplicating content
- Keep agent-specific details in agent files
- Use concise command examples
- Avoid redundant explanations
- Link to external docs rather than copying

## Granular Task Planning

**CRITICAL**: All tasks must be broken down into specific, measurable actions
with concrete values. This transparency ensures all implementation decisions are
visible and approved before execution.

### ❌ WRONG - Vague Tasks:

- "Style the navbar"
- "Optimize the API"
- "Update the database schema"
- "Improve the algorithm"

### ✅ CORRECT - Granular Tasks:

- "Change navbar height from 60px to 80px"
- "Reduce padding-top from 16px to 12px"
- "Adjust background from #ffffff to rgba(255,255,255,0.95)"
- "Add index on user_id column in tokens table"
- "Change API timeout from 30s to 10s"
- "Replace O(n²) nested loop with O(n log n) sort-then-process"
- "Increase cache TTL from 5 minutes to 15 minutes"

### Domain-Specific Examples:

**Frontend Tasks:**

- "Change button border-radius from 4px to 8px"
- "Update font-size from 14px to 16px for .heading-secondary"
- "Add 200ms ease-in-out transition to hover states"
- "Change grid from 3 columns to 4 columns on desktop (>1024px)"

**Backend Tasks:**

- "Add rate limiting: 100 requests per minute per IP"
- "Change batch size from 100 to 500 records"
- "Add retry logic: 3 attempts with exponential backoff (1s, 2s, 4s)"
- "Update validation: require email to match /^[^\s@]+@[^\s@]+\.[^\s@]+$/"

**Database Tasks:**

- "Add compound index on (user_id, created_at DESC)"
- "Change column type from VARCHAR(255) to TEXT"
- "Add CHECK constraint: price >= 0"
- "Set default value for status column to 'pending'"

**Algorithm Tasks:**

- "Replace linear search with binary search for sorted array"
- "Change hash function from MD5 to SHA-256"
- "Update threshold from 0.7 to 0.85 for matching algorithm"
- "Add memoization for recursive calls with cache size 1000"

## Agent Context7 MCP Documentation Requirements

**CRITICAL**: You MUST fetch latest documentation using Context7 MCP for their
area of responsibility before implementation. This ensures agents use current
APIs and best practices.

You MUST:

1. **Fetch documentation at task start** - Before any implementation
2. **Resolve library IDs** using `resolve-library-id`
3. **Fetch specific docs** with relevant topics using `get-library-docs`
4. **Use library-specific topics** - Target relevant documentation sections
5. **Apply latest patterns** - Use current best practices from docs

### Example Agent Implementation

```typescript
// At the start of any agent task
async function fetchRequiredDocs() {
  // Resolve library ID first
  const { libraryId } =
    (await mcp__context7__resolve) -
    library -
    id({
      libraryName: "react",
    });

  // Then fetch documentation with specific topic
  const docs =
    (await mcp__context7__get) -
    library -
    docs({
      context7CompatibleLibraryID: libraryId,
      topic: "hooks",
      tokens: 5000,
    });

  return docs;
}
```
