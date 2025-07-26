# Asset Tokenization Kit

## Project Overview

**SettleMint Asset Tokenization Kit** - A full-stack solution for building
digital asset platforms with blockchain tokenization.

## Repository Structure

```
asset-tokenization-kit/
├── kit/                   # Main application packages
│   ├── contracts/         # Smart contracts (Solidity)
│   ├── dapp/              # Modern React/TypeScript frontend
│   ├── dapp-v1/           # ⚠️ DEPRECATED - DO NOT USE
│   ├── subgraph/          # TheGraph indexing
│   ├── e2e/               # End-to-end tests
│   └── charts/            # Helm charts for deployment
├── tools/                 # Root-level utilities
└── docker-compose.yml     # Local development environment
```

## Essential Commands

### Development Setup

```bash
# Initial setup
bun install                      # Install dependencies
bunx settlemint connect --instance local  # Connect to SettleMint
bun run artifacts               # Generate artifacts (contracts, DB, ABIs)
bun run dev:up                  # Start Docker environment

# Daily development
bun run dev                     # Start dApp development server
bun run dev:reset              # Reset and restart Docker environment
```

### Quality Assurance

```bash
# Run full CI suite before creating PR
bun run ci                      # Runs: format, compile, codegen, lint, test

# Individual tasks
bun run format                  # Check code formatting
bun run lint                    # Run ESLint
bun run test                    # Run unit tests
bun run typecheck              # TypeScript type checking
bun run test:integration       # Integration tests
```

### Contract Development

```bash
# From root directory
bun run compile                 # Compile smart contracts
bun run codegen                # Generate TypeScript types
bun run artifacts              # Update genesis, DB, ABIs after contract changes
bun run contracts:test         # Run Foundry tests
```

### Quick Start for New Developers

```bash
# 1. Clone and setup
git clone <repo-url>
cd asset-tokenization-kit
bun install

# 2. Create feature branch (NEVER work on main!)
git checkout -b feature/your-feature-name

# 3. Connect to SettleMint and generate artifacts
bunx settlemint connect --instance local
bun run artifacts
bun run codegen

# 4. Start development environment
bun run dev:up
bun run dev

# 5. Before committing
bun run ci  # Must pass!
git add .
git commit -m "feat: your descriptive message"
```

## Technology Stack

Note: Check relevant package.json files for exact library versions, as they may
update frequently.

### Smart Contracts (`kit/contracts`)

- **Language**: Solidity 0.8.28
- **Framework**: Foundry (primary), Hardhat (deployment)
- **Standards**: ERC-3643 compliant security tokens
- **Architecture**: UUPS upgradeable proxy pattern
- **Testing**: Foundry with fuzz testing
- **Libraries**: OpenZeppelin, OnChain ID, SMART Protocol

Run `bun artifacts` and `bun codegen` before running any
testing/linting/formatting tasks.

### Frontend (`kit/dapp`)

- **Framework**: React 19 with Tanstack Start
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4, shadcn/ui
- **State**: Tanstack Query, Tanstack Form
- **API**: ORPC framework
- **Auth**: Better Auth
- **I18n**: i18next (Arabic, German, English, Japanese)
- **Build**: Vite with Bun

Before starting any work, run `bunx settlemint connect --instance local` and
`bun run codegen`.

### Subgraph (`kit/subgraph`)

- **Language**: AssemblyScript
- **Framework**: The Graph Protocol

### Backend Services

- **Database**: PostgreSQL with Drizzle ORM
- **GraphQL**: Hasura, TheGraph, Portal, Blockscout
- **File Storage**: IPFS, MinIO
- **Blockchain**: Besu network (local development)

## Git Workflow

CRITICAL: Never commit to main branch. NEVER, EVER commit to main, if you are
not on a branch, make a new one.

### Commit Format

`type(scope): description` (scope optional, description lowercase)

**Types:** feat, fix, chore, docs, style, refactor, perf, test, build, ci,
revert

### Branch Rules (CRITICAL)

```bash
# Check current branch FIRST
current_branch=$(git branch --show-current)
[[ "$current_branch" == "main" || "$current_branch" == "master" ]] && git checkout -b feature/name || echo "Using: $current_branch"
```

## MCP Server Integration

The project integrates with multiple MCP servers for enhanced development capabilities:

### 1. **Gemini-CLI** - AI-Powered Code Analysis
Primary use cases:
- Code quality analysis with `changeMode: true` for structured edits
- Architecture planning and design decisions  
- Security vulnerability detection
- Performance optimization suggestions
- Test case generation with `brainstorm`
- Pattern recognition across codebases

Example workflow:
```javascript
// Analyze code for improvements
mcp__gemini-cli__ask-gemini({
  prompt: "@file.ts analyze for performance and security",
  changeMode: true,
  model: "gemini-2.5-pro"
})

// Generate ideas
mcp__gemini-cli__brainstorm({
  prompt: "Design patterns for authentication flow",
  domain: "software",
  ideaCount: 15
})
```

### 2. **Context7** - Official Library Documentation
Primary use cases:
- Latest framework documentation (React, TanStack, Zod, etc.)
- API references and migration guides
- Best practices from official sources
- Type definitions and interfaces

Example workflow:
```javascript
// First resolve library ID
mcp__context7__resolve-library-id({
  libraryName: "tanstack-router"
})
// Then fetch docs
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/tanstack/router",
  topic: "loaders error-boundaries",
  tokens: 8000
})
```

### 3. **Grep** - Real-World Code Examples
Primary use cases:
- Find production implementations
- Discover coding patterns
- Learn from popular repositories
- Validate best practices

Example workflow:
```javascript
mcp__grep__searchGitHub({
  query: "useForm.*validation.*TanStack",
  language: ["TypeScript", "TSX"],
  useRegexp: true
})
```

### 4. **DeepWiki** - Repository Architecture & Documentation
Primary use cases:
- Understand project architecture
- Deep dive into open source projects
- Answer specific implementation questions
- Explore design decisions

Example workflow:
```javascript
mcp__deepwiki__ask_question({
  repoName: "tanstack/router",
  question: "How does file-based routing work internally?"
})
```

### 5. **Linear** - Project Management
Primary use cases:
- Track feature development
- Link PRs to issues
- Update task status
- Document progress

Example workflow:
```javascript
// Find related issues
mcp__linear__list_issues({
  organizationSlug: "your-org",
  query: "authentication bug"
})
// Update status
mcp__linear__update_issue({
  id: "ISSUE-123",
  status: "in_progress"
})
```

### 6. **Sentry** - Error Monitoring & Analysis
Primary use cases:
- Debug production errors
- Analyze error patterns
- Track performance issues
- Monitor deployment health

Example workflow:
```javascript
// Search for errors
mcp__sentry__search_issues({
  organizationSlug: "your-org",
  naturalLanguageQuery: "timeout errors in API"
})
// AI analysis
mcp__sentry__analyze_issue_with_seer({
  issueId: "ERROR-456"
})
```

### 7. **Playwright** - Browser Automation & E2E Testing
Primary use cases:
- Automated E2E testing
- Visual regression testing
- Debug UI issues
- Test user workflows

Example workflow:
```javascript
// Navigate and interact
mcp__playwright__browser_navigate({ url: "http://localhost:5173" })
mcp__playwright__browser_snapshot()
mcp__playwright__browser_click({
  element: "Submit button",
  ref: "button[type='submit']"
})
```

## MCP Best Practices

### Documentation Research Flow
1. **Context7** for official docs → **DeepWiki** for architecture → **Grep** for examples
2. Always verify with latest documentation before implementing
3. Cross-reference multiple sources for validation

### Error Investigation Flow
1. **Sentry** for error details → **Linear** for related issues → **Gemini** for analysis
2. Use Seer AI for root cause analysis
3. Track fixes in Linear with PR links

### Code Quality Flow
1. **Gemini** for initial analysis → **Grep** for patterns → **Context7** for best practices
2. Use `changeMode: true` for actionable improvements
3. Validate against production examples

### Testing Strategy Flow
1. **Gemini** for test generation → **Playwright** for E2E → **Sentry** for monitoring
2. Generate edge cases with brainstorm
3. Monitor test stability in production

## Sub-Agent Usage

Claude Code includes specialized sub-agents that MUST BE USED PROACTIVELY for
specific tasks:

### 🔍 code-reviewer

**USE PROACTIVELY**: After writing ANY code, before commits, or when reviewing
changes

- Performs comprehensive security, performance, and quality analysis
- Catches bugs, vulnerabilities, and suggests improvements
- Delivers Linus-style brutal honesty with actionable fixes

### 🐛 code-debugger

**USE WHEN**: Errors occur, tests fail, or code behaves unexpectedly

- Systematically diagnoses issues using multi-agent orchestration
- Handles runtime errors, performance issues, race conditions
- Generates detailed debug reports with root cause analysis

### 📦 pr-commit-manager

**USE WHEN**: When the user asks you to commit code or manage PRs

- Creates atomic commits with semantic messages
- Manages entire PR lifecycle from creation to merge
- Monitors CI/CD pipelines and handles review feedback

### 🧪 test-runner

**USE PROACTIVELY**: After implementing features, before commits, or when CI
fails

- Orchestrates comprehensive test execution
- Auto-fixes lint, format, and type errors
- Ensures 100% quality gate compliance

### 📚 codebase-documentation-architect

**USE PROACTIVELY**: After significant code changes or new features

- Creates comprehensive README.md files for modules
- Generates architecture diagrams with Mermaid
- Maintains CLAUDE.md with AI-specific instructions
- Documents patterns, conventions, and decisions

### 🧪 test-engineer

**USE PROACTIVELY**: After implementing any new functionality

- Creates unit tests for React components (Vitest)
- Develops Forge tests for smart contracts
- Ensures comprehensive test coverage
- Maintains test quality and performance

### ✍️ content-translations-writer

**USE WHEN**: Enhancing documentation or translating UI/content

- Improves README files with user-friendly explanations
- Adds clear overviews and getting started sections
- Translates UI components to Arabic, German, and Japanese
- Maintains translation consistency across namespaces
- Creates culturally appropriate translations

### 🚀 orpc-backend-expert

**USE WHEN**: Working with ORPC framework in kit/dapp/src/orpc folder

- Creates and optimizes ORPC API endpoints
- Implements security measures and rate limiting
- Ensures proper OpenAPI documentation generation
- **IMPORTANT**: When modifying database schemas, always run migrations:
  ```bash
  bun run db:generate  # Generate migration files
  bun run db:migrate  # Apply migrations
  ```
- **PR REQUIREMENT**: When creating a PR, squash all new migration files into a single migration to maintain clean migration history
- Uses latest ORPC patterns and best practices

### Slash Commands

The project includes custom slash commands that utilize these agents:

- `/code-review` - Invokes code-reviewer agent (with Gemini-CLI integration)
- `/test` - Invokes test-runner agent
- `/pr` - Invokes pr-commit-manager agent
- `/debug` - Invokes code-debugger agent for systematic debugging

Note: The implementation agent is invoked automatically when you request
features or changes, no slash command needed.

### Agent Features

#### Gemini-CLI Integration

All agents use Gemini-CLI for enhanced capabilities:

- Detects hidden bugs and edge cases
- Suggests performance optimizations
- Identifies security vulnerabilities
- Provides architectural improvements
- Generates comprehensive test cases
- Creates documentation structures

#### Extended Timeouts

Agents handle long-running operations:

- Forge compilation: 5-minute timeout support
- Large test suites: Adaptive timeout management
- Complex builds: Patient execution

#### Self-Learning Capabilities

Agents learn from your codebase and improve over time:

- **Pattern Recognition**: Identifies recurring issues and solutions
- **Team Preferences**: Learns your specific conventions
- **User Control**: All learnings require explicit approval
- **Knowledge Storage**: Learnings saved in `.claude/learnings/`

To approve a learning:

1. Agent proposes a pattern it discovered
2. You review and approve/reject
3. Approved patterns enhance future agent performance
4. Periodically consolidated into CLAUDE.md

#### Agent Chaining Workflow

Agents work together in a coordinated workflow:

1. **Implementation** (domain-specific agent) → Creates/modifies code
2. **Testing** (test-engineer) → Ensures comprehensive test coverage
3. **Documentation** (codebase-documentation-architect) → Creates technical README
4. **Content** (content-translations-writer) → Enhances README with clear explanations
5. **Review** (code-reviewer) → Final quality check

This ensures every feature is properly tested and documented in comprehensive README files.

## Coding Standards & AI Instructions

CRITICAL: Write code as if the person maintaining it is a violent psychopath who
knows where you live. Make it that clear.

## Important Notes

1. **Deprecated**: `kit/dapp-v1` folder is completely deprecated - use
   `kit/dapp`
2. **Artifacts**: Regenerate after contract changes with `bun run artifacts`
3. **Docker Reset**: Use `bun run dev:reset` after artifact changes
4. **Type Safety**: Always run `bun run typecheck` before committing
5. **CI Required**: `bun run ci` must pass before creating PRs
6. **Auto-generated Files**: `routeTree.gen.ts` is auto-generated, ignore it
7. **Subgraph Files**: ts files in kit/subgraph are AssemblyScript, not
   TypeScript!!!!
8. **Shadcn Components**: Never change files in the kit/dapp/src/components/ui
   folder, they are shadcn components and should not be modified

### The Ten Universal Commandments

1. Thou shalt ALWAYS use MCP tools before coding.
2. Thou shalt NEVER assume; always question.
3. Thou shalt write code that's clear and obvious.
4. Thou shalt be BRUTALLY HONEST in assessments.
5. Thou shalt PRESERVE CONTEXT, not delete it.
6. Thou shalt make atomic, descriptive commits.
7. Thou shalt document the WHY, not just the WHAT.
8. Thou shalt test before declaring done.
9. Thou shalt handle errors explicitly
10. Thou shalt treat user data as sacred

### General Instructions

#### Context Management

- Your primary responsibility is to manage your own context effectively. Always
  read relevant files in their entirety BEFORE planning or making changes.
  Partial reads lead to mistakes, duplication, or architectural
  misunderstandings.

#### Documentation and Code Quality

- When updating documentation, keep changes concise and focused to prevent
  bloat.
- Write code following KISS (Keep It Simple, Stupid), YAGNI (You Aren't Gonna
  Need It), and DRY (Don't Repeat Yourself) principles.
- Optimize code for readability, as it is read more often than written.
- Apply SOLID principles where appropriate, leveraging modern framework features
  over custom implementations.
- Prioritize industry-standard libraries and frameworks over custom solutions.
- Never use mocks, placeholders, or omit code. Implement fully unless explicitly
  instructed otherwise.
- No "dummy" implementations; deliver complete, functional code.

#### Development Workflow

- For new tasks, first understand the current architecture, identify files to
  modify, and create a detailed Plan. Include architectural considerations, edge
  cases, and optimal approaches. Get user approval before coding.
- Commit early and often, but NEVER to the main branch—create a new feature
  branch first. Break large tasks into milestones and commit at each.
- Always run formatting, linting, and tests after major changes to catch errors
  early.
- Do not run servers yourself; instruct the user to run them for testing.
- For repeated issues, identify root causes rather than trial-and-error or
  abandoning approaches.
- Do not perform large refactors unless explicitly instructed.
- When tasks are vague or large, break them into subtasks. If needed, ask the
  user for clarification or assistance in decomposition.
- Use parallel subagents for similar tasks across multiple files to increase
  efficiency.
- **Fixes**: When asked to fix something, do not care if it is related to the
  current change or not
- **Temporary Files**: Do not store temporary analysis md files, and if you
  absolutely need to, make sure to clean them up before committing

#### Best Practices and Honesty

- Follow proven best practices when in doubt.
- Be brutally honest in assessing ideas—clearly state if something is good or
  bad.
- Make side effects explicit and minimal.
- Design database schemas to be evolution-friendly, avoiding breaking changes.
- Treat user data as sacred; handle with utmost care.
- For UI/UX work, ensure designs are aesthetically pleasing, user-friendly, and
  adhere to best practices, including interaction patterns and
  micro-interactions. Stick to existing components and styles where possible.

#### Research and Tools

- Your knowledge of libraries may be outdated; always verify latest syntax and
  usage via Context7 (preferred), DeepWiki, or web search (if others
  unavailable).
- Do not skip or abandon libraries if they "aren't working"—correct syntax or
  usage instead, especially if user-specified.
- Prioritize sources: Codebase > Documentation > Training data.
- Research current documentation; don't rely on outdated knowledge.
- Ask questions early and often for clarity—never assume.
- Use slash commands for consistent workflows.
- Derive documentation on-demand.
- Employ extended thinking for complex problems.
- Use visual inputs for UI/UX debugging.
- Test locally before pushing changes.
- Think simple: clear, obvious, no unnecessary complexity.

#### Expertise

- You are a highly talented polyglot with decades of experience in software
  architecture, system design, development, UI/UX, copywriting, and more.

### Solidity

- Use OpenZeppelin contracts where possible
- Follow Checks-Effects-Interactions pattern
- Implement events for all state changes
- Use custom errors for gas efficiency
- Comprehensive NatSpec comments for all public/external functions
- Design for upgradability with UUPS proxy pattern
- Implement access control and security best practices
- Optimize for gas efficiency (storage packing, immutable vars)
- Comprehensive testing with Foundry (fuzz, coverage)

For full rules, refer to Solhint configuration (.solhint.json) and NatSpec
standards.

### Typescript / React

- **Logging**: Use `createLogger()`, never `console.log`
- **Error Handling**: Use error boundaries (DefaultCatchBoundary for routes,
  DataTableErrorBoundary for tables) and toast notifications with
  formatValidationError
- **State Management**: Prefer URL state for persistent UI configuration, local
  state for ephemeral interactions
- **TanStack Query**: Configure staleTime/cacheTime for performance. Use select
  option to transform data and minimize re-renders. Destructure only needed
  properties (avoid spread operator). Keep select functions stable (outside
  component or in useCallback). Never copy query data to local state - use
  directly. Use invalidateQueries for mutations. Prefetch data in loaders for
  SSR
- **TanStack Router**: Use route loaders for data fetching (separates data logic
  from UI). Enable defaultPreload: 'intent' for automatic link preloading. Use
  selective state subscription (Route.useSearch({ select: s => s.param })) to
  minimize re-renders. Enable structural sharing for URL state stability
- **Imports**: No barrel files (index.ts exports); during refactors, if you
  encounter barrel files, remove them
- **Testing**: Use `vitest` for testing; tests are stored next to the
  route/component/file, not in a `__tests__` folder
- **Components**: Keep files under 350 lines, split when needed
- **Security**: Never commit secrets, validate all inputs
- **Type Safety**: Use full types when possible, e.g. User and not { role?:
  string } if you just need the role; `as any` is NEVER allowed!
- **Performance**: The project uses React Compiler (babel-plugin-react-compiler)
  for automatic optimizations. DO NOT go overboard with useMemo or useCallback
  unless a component has the "use no memo" directive (only used for TanStack
  Table compatibility) or linting requires it. React Compiler handles
  memoization automatically
- **TanStack Form**: Use headless hooks (useForm, useField) for fine-grained
  updates - each field component subscribes to its own state slice. Define form
  types/schemas (Zod/Yup) for type safety. Prefer schema validation on
  blur/submit over keystroke. Use form.reset() for state management. Trust
  TanStack Form's React compliance - it follows hooks rules rigorously
- **Component Structure**: Keep components small and focused for better compiler
  optimization. Follow Hooks Rules strictly - no conditional hooks or early
  returns that bypass hooks. Prefer plain functions over manual memoization
- **Static Hoisting**: Move constants and pure helpers outside components when
  they don't depend on props/state. Use custom hooks for reusable stateful logic
- **Pure Renders**: Avoid side-effects in render. Use effects for initialization
- **Compiler Opt-Out**: Use "use no memo"; directive sparingly as last resort
  for components that can't be refactored to satisfy compiler rules
- **Compiler Pitfalls**: Avoid manual memoization - let compiler handle it.
  Don't ignore opt-out warnings. Minimize Context use (prefer TanStack state).
  Handle async boundaries with loading states. Periodically remove old
  workarounds
- **Translations**: Organized into focused namespaces - use multiple namespaces
  in components as needed; use very specific translation namespaces for each
  component (e.g., "detail-grid" for the DetailGrid component, not "common");
  never pass around `t` from the translations hook, if you cannot get `t` into a
  function, you shouldn't use such a function
- **Localization Guidelines**:
  - The UI supports multiple languages: Arabic (ar), German (de), English (en), Japanese (ja)
  - Always put English translations in kit/dapp/locales/en/*.json first
  - Use the content-translations-writer agent to translate to other languages
  - Never auto-generate translations without the specialized agent
  - If you see hardcoded strings in a component, move them to translation files
  - Maintain consistent terminology across all language files
- **Directives**: Since we use Tanstack Start, we do not need `use client;`
- **Linting**: Never use eslint-disable comments, fix the issues for real
- **Forms**: Use TanStack Form exclusively for all forms. Do NOT use
  react-hook-form or @hookform/resolvers/zod - they have been removed from the
  project. For form components, use the existing TanStack Form patterns found in
  the codebase

For comprehensive rules, refer to the ESLint configuration in .eslintrc files.
Key principles include:

- Accessibility compliance (ARIA, keyboard navigation)
- Performance optimizations (React Compiler handles memoization automatically)
- Type safety (no 'any', explicit types)
- Modern JavaScript patterns (prefer arrow functions, template literals)
- Security best practices (input validation, no dangerous props)

### Turborepo

This project uses Turborepo for managing the monorepo structure, enabling
efficient build orchestration across packages.

- Run all package.json scripts from the root directory to ensure proper
  execution of pre/post hooks and turbo dependencies.
- Benefits include task caching for faster rebuilds, parallel task execution,
  and dependency graph management.
- Configuration is defined in turbo.json at the root, including pipeline
  definitions and cache settings.

### Package Manager: Bun (Default)

```bash
bun <file>            # instead of node/ts-node
bun install/run/test  # instead of npm/yarn/pnpm
# Auto-loads .env files (no dotenv needed)
```

## Memory

- Use sentence case wherever you can
- Do not use dynamic translation keys as our scanner does not pick those up
- When adding new UI components with text, always invoke content-translations-writer for translations
- Translation files are in kit/dapp/locales/{ar,de,en,ja}/*.json
- Each component should have its own translation namespace

## Development Memories

- Shadcn components are never the problem