# Asset Tokenization Kit (ATK) - AI Agent Guidelines

## 🎯 Project Overview

Asset Tokenization Kit is a production-ready blockchain tokenization platform
implementing ERC-3643 (T-REX) standard for compliant security tokens. This
monorepo contains smart contracts, dApp, subgraph, and deployment
infrastructure.

## 🏗️ Project Structure & Module Organization

- Monorepo root uses Turborepo. Workspaces live under `kit/*`.
- `kit/contracts`: ERC‑3643 Solidity (Foundry/Hardhat); tests in `test/`.
- `kit/dapp`: React 19 app (TanStack, Drizzle, oRPC); tests in `test/`, static
  assets in `public/`.
- `kit/subgraph`: TheGraph subgraph (AssemblyScript); sources in `src/`,
  artifacts in `build/`.
- `kit/charts`: Helm charts for deployment.
- `kit/e2e`: Playwright UI/API tests and helpers.

## Build, Test, and Development Commands

- Install: `bun install`
- Lint: `bun run lint` — runs linters across all workspaces.
- Test: `bun run test` — unit tests (Foundry, Vitest, subgraph).
- CI suite: `bun run ci` — compile, codegen, lint, test, typecheck, build,
  artifacts.
- Dev: `bun run dev` — starts watch processes (dApp + tools). Run from repo
  root.
- E2E: `bun run test:e2e:ui` / `bun run test:e2e:api` (from root).

## Coding Style & Naming Conventions

- TypeScript/React: Prettier (2‑space indent), ESLint
  (`kit/dapp/eslint.config.mjs`).
- Solidity: `solc 0.8.30`, Foundry fmt (4‑space indent), `solhint`
  (`kit/contracts/.solhint.json`).
- Filenames: kebab‑case for files, PascalCase for React components, camelCase
  for variables/functions.
- Keep modules small; colocate tests in nearest `test/` directory.

## Testing Guidelines

- Contracts: Foundry (`forge test` via `bun run test`), gas/coverage enabled;
  place tests in `kit/contracts/test`.
- dApp: Vitest + Testing Library; place tests in `kit/dapp/test` and
  `src/**/__tests__` when co‑located.
- Subgraph: unit tests in `kit/subgraph/test`; rebuild with `bun run build`
  before running.
- E2E: Playwright configs in `kit/e2e`; prefer data‑setup via API utilities.

## Commit & Pull Request Guidelines

- Branching: never commit to `main`; create feature branches:
  `feature/<short-scope>`.
- Commits: `type(scope): description` (e.g., `feat(dapp): add auth`,
  `fix(contracts): overflow`).
- PRs: include purpose, linked issues, screenshots/logs, and note breaking
  changes. Must pass `bun run ci`.

## Security & Configuration Tips

- Manage secrets via `.env.local` (never commit secrets). Use provided `.env`
  templates.
- Run all commands from repo root; do not modify generated files under
  `.generated/`.

## Documentation Lookup via Context7 MCP

- Always consult Context7 MCP first for the latest stable documentation of any
  library, framework, or tool used in this repo.
- Resolve the canonical library ID once, then fetch its docs for precise API
  signatures and options.
- Prefer TypeScript examples when both TS and JS variants exist; mirror exact
  option names from docs.
- If the repo’s dependency version lags behind latest stable, note breaking
  changes but follow the repo version unless upgrading is explicitly in scope.
- Re-check docs after dependency updates and before major refactors.

Example workflow using Context7 MCP:

```ts
// Resolve the canonical library id
const { context7CompatibleLibraryID } = await mcp__context7__resolve_library_id(
  {
    libraryName: "react",
  }
);

// Fetch latest docs for that id
const docs = await mcp__context7__get_library_docs({
  context7CompatibleLibraryID, // e.g. "/facebook/react"
});

// Use `docs` to cite exact API signatures and options in code/reviews
```

## 🤖 AI Agent Behavior Specifications

### Core Principles

1. **Direct Action**: Execute tasks immediately without unnecessary explanations
2. **Complete Resolution**: Continue working until the entire request is fully
   resolved
3. **Context Awareness**: Understand module boundaries and dependencies
4. **Production Quality**: Write code that's ready for production, not
   prototypes
5. **Instruction Sensitivity**: Adapt to the communication style and structure
   established in prompts
6. **Planning Before Execution**: Excel with explicit planning phases before
   implementation

### Structured Prompting Techniques

#### Task Specification Format

When receiving complex ATK tasks, process them using this structure:

```xml
<task_spec>
  Definition: [Exact requirement in ATK context]
  Module: [contracts/dapp/subgraph/charts/e2e]
  When Required: [Conditions that trigger this implementation]
  Format & Style: [Code conventions, patterns to follow]
  Sequence: [Step-by-step order of implementation]
  Dependencies: [Required modules, libraries, contracts]
  Prohibited: [Anti-patterns to avoid]
  Validation: [How to verify correctness]
</task_spec>
```

#### Pre-Execution Protocol

Before implementing any ATK feature:

```
Before responding, please:
1. Decompose the request into ATK module components
2. Identify dependencies across contracts, dApp, and subgraph
3. Check existing patterns in the codebase for consistency
4. Create a structured approach respecting module boundaries
5. Validate understanding against ERC-3643 requirements
```

### Task Execution Protocol

#### 1. Smart Contract Development (`kit/contracts`)

When working with smart contracts:

```
BEFORE: Analyze existing contracts for patterns and conventions
PLAN: Identify all required interfaces, modifiers, and dependencies
EXECUTE:
  - Write contract following ERC-3643 compliance requirements
  - Include comprehensive NatSpec documentation
  - Add events for all state changes
  - Implement access control patterns consistently
  - Write Foundry tests covering all functions and edge cases
VALIDATE: Run `forge test` and `forge coverage`
```

#### 2. dApp Development (`kit/dapp`)

When implementing frontend features:

```
BEFORE: Check existing components and patterns in the codebase
PLAN: Identify all UI components, API routes, and state management needs
EXECUTE:
  - Use existing UI components from `src/components/ui/`
  - Implement oRPC routes with proper validation using Zod
  - Use TanStack Query for data fetching (never local state copies)
  - Follow React 19 patterns (no manual memo, use Suspense)
  - Add proper TypeScript types for all props and returns
  - Write Vitest tests for components and routes
VALIDATE: Run `bun run typecheck` and `bun run test`
```

#### 3. Subgraph Development (`kit/subgraph`)

When updating TheGraph mappings:

```
BEFORE: Review existing entity schemas and handlers
PLAN: Map all events to entity updates
EXECUTE:
  - Update schema.graphql with new entities
  - Create event handlers in AssemblyScript
  - Use proper ID generation patterns
  - Handle all edge cases (null checks, defaults)
  - Run codegen after schema changes
VALIDATE: Run `bun run build` in subgraph directory
```

### Module-Specific Instructions

#### Contracts Module

- **Token Creation**: Always extend from ISMART interfaces
- **Compliance**: Implement country/identity allow/block lists
- **Factory Pattern**: Use existing factory contracts as templates
- **Testing**: Write fuzz tests for critical functions
- **Gas Optimization**: Check gas reports after changes

#### dApp Module

- **Authentication**: Use Better Auth middleware patterns
- **Forms**: TanStack Form with Zod validation
- **Routing**: File-based routing with proper layouts
- **API**: oRPC procedures with proper context access
- **State**: Never copy server state, use React Query

#### Subgraph Module

- **Entity IDs**: Use deterministic ID generation
- **Relations**: Properly link entities with @derivedFrom
- **Performance**: Avoid loading unnecessary entities
- **Null Safety**: Always check for null before accessing

### Agentic Behavior Enhancement

#### Complete Task Resolution

For ATK features requiring multiple steps:

```
Remember: Continue working until the entire feature is fully implemented.
- Decompose into ALL required sub-tasks across modules
- Complete contracts before dApp implementation
- Update subgraph after contract changes
- Confirm each module integration before moving on
- Only conclude when CI passes and feature is fully functional
- Handle cross-module dependencies without losing context
```

#### Preamble Explanations

Control explanation verbosity for ATK tasks:

**For concise progress updates:**

```
Every so often, explain notable actions - not before every step,
but when:
- Completing a module (contracts/dApp/subgraph)
- Making architectural decisions
- Encountering and resolving issues
```

**For detailed implementation tracking:**

```
Before each major action:
- State which ATK module you're modifying
- Explain the pattern you're following
- Note any ERC-3643 compliance considerations
```

#### Parallel Processing

Leverage parallel execution in ATK development:

```
Process independent ATK tasks simultaneously:
- Generate multiple contract interfaces in parallel
- Create UI components while writing API routes
- Write tests for different modules concurrently
- Update multiple subgraph handlers simultaneously

Avoid parallel processing when:
- Contract changes affect dApp types
- Subgraph schema impacts API queries
- Authentication flow affects multiple modules
```

### Common Workflows

#### Adding a New Token Type

1. Create factory contract in `kit/contracts/src/assets/`
2. Add deployment script in `kit/contracts/script/`
3. Create subgraph entities and handlers
4. Build oRPC routes for token operations
5. Add UI components for token management
6. Write e2e tests for full flow

#### Implementing Compliance Module

1. Create compliance contract with ICompliance interface
2. Add to ComplianceModuleRegistry
3. Create subgraph handlers for compliance events
4. Build admin UI for compliance configuration
5. Add integration tests

#### Adding Authentication Feature

1. Extend Better Auth configuration
2. Create auth middleware if needed
3. Add protected routes with guards
4. Update user context types
5. Test auth flows with Playwright

### Error Handling Patterns

#### Smart Contracts

```solidity
// Use custom errors
error Unauthorized(address caller);
error InvalidAmount(uint256 provided, uint256 required);

// Emit events for important failures
emit OperationFailed(reason);
```

#### dApp

```typescript
// Use oRPC error types
throw new ORPCError({
  code: "NOT_FOUND",
  message: "User-friendly message",
});

// Handle errors in UI with toast notifications
```

#### Subgraph

```typescript
// Log warnings but don't crash
log.warning("Entity not found: {}", [id]);
// Provide sensible defaults
entity.value = entity.value || BigInt.zero();
```

### Performance Considerations

1. **Contracts**: Minimize storage operations, use events over storage
2. **dApp**: Implement code splitting, lazy load heavy components
3. **Subgraph**: Batch entity saves, avoid nested loops
4. **General**: Profile before optimizing, measure impact

### Security Checklist

Before committing any code:

- [ ] No hardcoded secrets or private keys
- [ ] Input validation on all user data
- [ ] Access control on sensitive operations
- [ ] Reentrancy guards on contract functions
- [ ] SQL injection prevention in database queries
- [ ] XSS prevention in rendered content
- [ ] CSRF tokens on state-changing operations

### Testing Requirements

Every feature must include:

1. **Unit tests**: Core logic isolation
2. **Integration tests**: Module interactions
3. **E2E tests**: User workflows
4. **Gas tests**: For contract changes
5. **Load tests**: For performance-critical paths

### Documentation Standards

- **Contracts**: Full NatSpec for public/external functions
- **dApp**: JSDoc for exported functions and components
- **API**: OpenAPI/oRPC contract definitions
- **README**: Update when adding new features

### Debugging Approach

When encountering issues:

1. Read error messages completely
2. Check recent changes with `git diff`
3. Verify environment variables are set
4. Run isolated tests for the failing component
5. Use debugging tools (Foundry debugger, React DevTools)
6. Check logs in all related services

### Git Workflow

```bash
# Start new feature
git checkout -b feature/descriptive-name

# Make atomic commits
git add -p  # Stage selectively
git commit -m "type(scope): clear description"

# Before pushing
bun run ci  # Must pass all checks

# Create PR with template
# Link issues, add screenshots, note breaking changes
```

### Common Pitfalls to Avoid

1. **Don't modify `ui/*` components** - they're from shadcn
2. **Don't use `bun:test`** - use `bun run test`
3. **Don't commit to main** - always use feature branches
4. **Don't copy server state** - use React Query
5. **Don't skip tests** - they catch critical issues
6. **Don't ignore linter warnings** - they prevent bugs
7. **Don't hardcode values** - use environment variables
8. **Don't assume context** - verify with existing code

### Resource Optimization

- **Batch operations** when possible
- **Cache expensive computations**
- **Lazy load non-critical resources**
- **Compress images and assets**
- **Tree-shake unused dependencies**
- **Use CDN for static assets**

### Best Practices for Different ATK Use Cases

#### Token Implementation

```
1. Start with interface definitions (ISMART extensions)
2. Implement factory pattern following existing assets
3. Add comprehensive event emissions for all state changes
4. Create deployment scripts with proper configuration
5. Update subgraph to index new token events
6. Build UI components for token interaction
```

#### Compliance Module Development

```
1. Define compliance rules in smart contract
2. Implement country/identity verification logic
3. Add to ComplianceModuleRegistry
4. Create admin interface for rule management
5. Write comprehensive test scenarios
```

#### Authentication & KYC Flow

```
1. Extend Better Auth configuration
2. Implement identity verification middleware
3. Create UI flow for document upload
4. Add progress tracking in database
5. Integrate with on-chain identity registry
```

#### Performance Optimization

```
1. Profile current implementation with tools
2. Identify bottlenecks (gas costs, query times)
3. Implement optimizations incrementally
4. Measure impact of each change
5. Document optimization decisions
```

### Advanced Techniques

#### TODO Tool Implementation

Track ATK development progress systematically:

```markdown
Track progress with:

- [ ] Smart Contract Implementation
  - [ ] Interface definition
  - [ ] Core logic
  - [ ] Access control
  - [ ] Events and errors
  - [ ] NatSpec documentation
- [ ] dApp Integration
  - [ ] oRPC routes
  - [ ] UI components
  - [ ] Form validation
  - [ ] Error handling
- [ ] Subgraph Updates
  - [ ] Schema changes
  - [ ] Event handlers
  - [ ] Entity relationships
- [ ] Testing
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] E2E scenarios
- [ ] Final Validation
  - [ ] CI passes
  - [ ] Gas optimization verified
  - [ ] Security considerations reviewed
```

#### Error Prevention

Validate ATK implementations before completion:

```
Before marking any ATK feature complete:
1. Verify ERC-3643 compliance maintained
2. Check all module integrations work
3. Ensure no regression in existing tests
4. Validate gas costs are acceptable
5. Confirm UI reflects contract state accurately
6. Review security implications
7. Document any breaking changes
```

#### Reasoning and Validation Steps

For complex ATK features, always include:

- **Pre-execution Reasoning**: "Analyze how this fits into the existing ATK
  architecture"
- **Planning Phase**: "Map all cross-module dependencies and interactions"
- **Implementation Checkpoints**: "Verify each module works independently before
  integration"
- **Integration Validation**: "Test module interactions thoroughly"
- **Post-implementation Review**: "Confirm feature meets all ERC-3643
  requirements"

### Example Task Template

When implementing ATK features, structure your approach:

```xml
<atk_request>
  Feature: [New token type / Compliance module / UI component]
  Modules Affected: [contracts, dApp, subgraph]
  Compliance Requirements: [ERC-3643 sections affected]
</atk_request>

<implementation_plan>
  1. Review existing implementations for patterns
  2. Create contract interfaces and implementations
  3. Write comprehensive tests
  4. Update subgraph schema and handlers
  5. Build API routes with validation
  6. Implement UI with proper state management
  7. Add e2e tests for complete flow
  8. Run full CI suite
</implementation_plan>

<validation_criteria>
  - All tests pass (unit, integration, e2e)
  - Gas costs within acceptable limits
  - UI correctly reflects blockchain state
  - No security vulnerabilities introduced
  - Documentation updated
</validation_criteria>
```

### When Stuck

1. Search existing codebase for similar patterns
2. Check documentation with Context7 MCP
3. Review git history for context
4. Run specific test suites for clarity
5. Use AI tools for exploration, not final implementation
6. Check CLAUDE.md files in each module for specific guidance
7. Review recent PRs for implementation examples
