# CLAUDE.md

## General rules

- Always read entire files. Otherwise, you don't know what you don't know, and
  will end up making mistakes, duplicating code that already exists, or
  misunderstanding the architecture.
- Commit early and often. BUT NEVER TO THE main BRANCH, create a new branch
  first!!! When working on large tasks, your task could be broken down into
  multiple logical milestones. After a certain milestone is completed you should
  commit it. If you do not, if something goes wrong in further steps, we would
  need to end up throwing away all the code, which is expensive and time
  consuming.
- Your internal knowledgebase of libraries might not be up to date. When working
  with any external library, unless you are 100% sure that the library has a
  super stable interface, you will look up the latest syntax and usage via
  either Context7 (first preference), DeepWiki or web search (less preferred,
  only use if Context7 and DeepWiki are not available)
- Do not say things like: "x library isn't working so I will skip it".
  Generally, it isn't working because you are using the incorrect syntax or
  patterns. This applies doubly when the user has explicitly asked you to use a
  specific library, if the user wanted to use another library they wouldn't have
  asked you to use a specific one in the first place.
- Always run format, linting and tests after making major changes. Otherwise,
  you won't know if you've corrupted a file or made syntax errors, or are using
  the wrong methods, or using methods in the wrong way.
- Code is read more often than it is written, make sure your code is always
  optimised for readability
- Unless explicitly asked otherwise, the user never wants you to do a "dummy"
  implementation of any given task. Never do an implementation where you tell
  the user: "This is how it _would_ look like". Just implement the thing.
- Whenever you are starting a new task, it is of utmost importance that you have
  clarity about the task. You should ask the user follow up questions if you do
  not, rather than making incorrect assumptions.
- Do not carry out large refactors unless explicitly instructed to do so.
- When starting on a new task, you should first understand the current
  architecture, identify the files you will need to modify, and come up with a
  Plan. In the Plan, you will think through architectural aspects related to the
  changes you will be making, consider edge cases, and identify the best
  approach for the given task. Get your Plan approved by the user before writing
  a single line of code.
- If you are running into repeated issues with a given task, figure out the root
  cause instead of throwing random things at the wall and seeing what sticks, or
  throwing in the towel by saying "I'll just use another library / do a dummy
  implementation".
- You are an incredibly talented and experienced polyglot with decades of
  experience in diverse areas such as software architecture, system design,
  development, UI & UX, copywriting, and more.
- When doing UI & UX work, make sure your designs are both aesthetically
  pleasing, easy to use, and follow UI / UX best practices. You pay attention to
  interaction patterns, micro-interactions, and are proactive about creating
  smooth, engaging user interfaces that delight users. The more you can stick to
  existing components and styles in the project, the happier your users will be.
- When you receive a task that is very large in scope or too vague, you will
  first try to break it down into smaller subtasks. If that feels difficult or
  still leaves you with too many open questions, push back to the user and ask
  them to consider breaking down the task for you, or guide them through that
  process. This is important because the larger the task, the more likely it is
  that things go wrong, wasting time and energy for everyone involved.
- When doing similar tasks across multiple files, always try to spawn a fleet of
  sub agents to handle the work more quickly

# Git Commit & Branch Rules

## Commit Format

`type(scope): description` (scope optional, description lowercase)

**Types:** feat, fix, chore, docs, style, refactor, perf, test, build, ci,
revert

## Branch Rules (CRITICAL)

```bash
# Check current branch FIRST
current_branch=$(git branch --show-current)
[[ "$current_branch" == "main" || "$current_branch" == "master" ]] && git checkout -b feature/name || echo "Using: $current_branch"
```

✅ One feature = one branch = one PR ❌ NO nested branches or multiple PRs per
feature

## Special Patterns

- Dependencies: `chore(deps):`, `fix(deps):`, `build(deps):`
- Breaking changes: `BREAKING CHANGE:` in body
- PR title = first commit message

## Examples

✅ feat: add user authentication ✅ fix(api): resolve timeout issue ✅
chore(deps): update react to v18 ✅ feat: redesign API endpoints ❌ Feature: Add
user auth ❌ added new feature

# MCP Server Usage

## Linear (Project Management)

- **Search/Get:** `mcp_linear_list_issues(query="ENG-3236")`,
  `mcp_linear_get_issue(id="ENG-3236")`
- **Update:** `mcp_linear_update_issue(id, stateId?, description?)`
- **Comment:** `mcp_linear_create_comment(issueId, body="PR: https://...")`

## Sentry (Error Tracking)

- **Find:** `mcp_sentry_find_organizations()`,
  `mcp_sentry_find_issues(organizationSlug, query="is:unresolved")`
- **Details:** `mcp_sentry_get_issue_details(organizationSlug, issueId)`
- **Update:** `mcp_sentry_update_issue(organizationSlug, issueId, status)`

## Context7 & DeepWiki (Documentation)

- **Context7:** `resolve-library-id(libraryName)` →
  `get-library-docs(libraryID, topic?)`
- **DeepWiki:** `read_wiki_structure(repoName)`, `read_wiki_contents(repoName)`,
  `ask_question(repoName, question)`

**Note:** Always link PRs in Linear comments and include Linear IDs in PR
descriptions.

## Ticket Management

- Use Linear to manage the metadata of a Linear ticket that you are asked to
  manage. Do this when you start and during the lifecycle of your work/pr so we
  can keep track of progress.

# Quality control

- Before deciding the task is done, make sure `bun run ci` completes sucessfully
- Before opening a PR, make sure `bun run ci` completes sucessfully

# Tooling & Commands

## Turborepo

- this is a tuborepo mono repo
- run all package.json scripts from the root so the correct pre/post and turbo
  dependencies run

## Package Manager: Bun (Default)

```bash
bun <file>            # instead of node/ts-node
bun install/run/test  # instead of npm/yarn/pnpm
# Auto-loads .env files (no dotenv needed)
```

## CLI Tools

- **jq**: JSON parsing (`brew install jq`)
- **yq**: YAML parsing (`brew install yq`)
- **ast-grep**: Syntax-aware search (`brew install ast-grep`)
  ```bash
  ast-grep --lang typescript -p 'function $NAME($_) { $$$ }'
  ```

## Automatic Command Usage

### Core Commands (@/.claude/commands/)

| Command     | When to Use                            |
| ----------- | -------------------------------------- |
| `/pr`       | Creating pull requests                 |
| `/qa`       | Before PR or after significant changes |
| `/comments` | When code lacks documentation          |
| `/setup`    | Configure MCP servers                  |
| `/stuck`    | After 5+ mins debugging same issue     |

### Proactive Usage

- Multiple code changes → Run `/qa`
- New functions without docs → Run `/comments`
- Complex debugging → Run `/stuck`
- Major refactoring → Run `/qa` before completion

**Note:** Commands are comprehensive workflows, not single actions. Read full
command files for details.

## Sub Agents (Use More!)

Ideal for:

- **Multi-file operations**: Pattern searches, relationship mapping
- **Refactoring**: Breaking down steps, impact analysis
- **Architecture**: Dependencies, data flows, API discovery
- **Debugging**: Error patterns, log analysis, execution tracing
- **Impact analysis**: Usage finding, test coverage gaps

💡 Sub agents work in parallel and handle open-ended searches better than
sequential tools.

# Ultracite Rules

## Accessibility

- Valid ARIA usage: roles, properties, required attributes
- Keyboard support: focusable elements, handlers (onClick→onKey\*)
- Required attributes: lang (html), title (iframe/SVG), type (button)
- Meaningful content: alt text, labels, headings
- No: accessKey, aria-hidden on focusable, distracting elements

## TypeScript

- Forbidden: any, @ts-ignore, enums, namespaces, var
- Required: import/export type, const for single assignment
- No: non-null assertions (!), parameter reassignment, type annotations on
  literals
- Arrays: T[] or Array<T> consistently

## React/Next.js

- Keys: no array indices
- Hooks: complete deps, top-level only
- No: nested components, prop assignment, <img> in Next.js
- Use: <></> over Fragment

## Code Quality

- No unused: imports, variables, parameters, labels, members
- No duplicates: cases, members, conditions, JSX props, keys
- No empty: blocks, interfaces, destructuring
- Required: === over ==, isNaN() for NaN, exhaustive switches

## Modern Practices

- Prefer: for...of, String.slice(), .at(), Date.now(), template literals
- Use: node: protocol, object spread, numeric separators
- Include: radix in parseInt(), Symbol descriptions
- No: delete, eval, console, debugger, hardcoded secrets

## Clean Code

- No: nested ternaries, yoda expressions, unnecessary code
- Group: getters/setters, overload signatures
- Handle: promises, errors (new Error), import cycles
- Consistent: object literals, curly braces, accessibility modifiers

# TypeScript Guidelines

## Core Principles

- **Strict mode always** (all strict compiler options)
- **Never use `any`** without exceptional justification (OK in generic function
  bodies)
- **Prefer `type` over `interface`** unless you need declaration merging
- **Use `readonly` by default**
- **No default exports** (unless framework requires)
- **Import type** for type-only imports

## Key Patterns

### Discriminated Unions (prevent impossible states)

```ts
type FetchState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };
```

### Const Assertions over Enums

```ts
const Status = { PENDING: "PENDING", APPROVED: "APPROVED" } as const;
type Status = (typeof Status)[keyof typeof Status];
```

### Result Types for Error Handling

```ts
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
```

### Branded Types

```ts
type UserId = string & { readonly brand: unique symbol };
const UserId = (id: string): UserId => id as UserId;
```

## Naming Conventions

- **Files:** `kebab-case.ts`
- **Variables/Functions:** `camelCase`
- **Types/Classes:** `PascalCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **Type Parameters:** `TKey`, `TValue` (prefix with T)

## Important Rules

- Return types on top-level functions (except JSX components)
- Parameter objects over multiple parameters
- Optional properties sparingly (prefer `T | undefined`)
- `noUncheckedIndexedAccess` aware (changes array/object access behavior)
- Schema-first with Zod: define schema → derive type
- Type guards for runtime checking
- Install packages with `bun add` for latest versions

## Memories

- Completely ignore dapp-v1 folder - it's deprecated
- Do not use vitest to make tests, use bun:test
- Asset types are centralized in the zod validator (no more cryptocurrency)
- never use barrel files
- Do not use console.log, use const logger = createLogger({ level:
  (process.env.SETTLEMINT_LOG_LEVEL as LogLevel) || "info", });
- do not modify code in kit/dapp/src/components/ui, this is where we store
  shadcn components we want to keep immutable for easy upgrading
- NEVER, EVER commit to main, if you are not on a branch, make a new one
