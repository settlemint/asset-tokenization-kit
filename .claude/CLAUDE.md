# CLAUDE.MD - AI Context Template (claude-master)

## 3. Coding Standards & AI Instructions

### General Instructions

- Your most important job is to manage your own context. Always read any
  relevant files BEFORE planning changes.
- When updating documentation, keep updates concise and on point to prevent
  bloat.
- Write code following KISS, YAGNI, and DRY principles.
- When in doubt follow proven best practices for implementation.
- Do not run any servers, rather tell the user to run servers for testing.
- Always consider industry standard libraries/frameworks first over custom
  implementations.
- Never mock anything. Never use placeholders. Never omit code.
- Apply SOLID principles where relevant. Use modern framework features rather
  than reinventing solutions.
- Be brutally honest about whether an idea is good or bad.
- Make side effects explicit and minimal.
- Design database schema to be evolution-friendly (avoid breaking changes).
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
- When doing similar tasks across multiple files, always try to spawn parallel
  subagents to handle the work more quickly in parallel tasks.

### Code quality

#### Solidity

- Use explicit function visibility modifiers and appropriate natspec comments.
- Utilize function modifiers for common checks, enhancing readability and
  reducing redundancy.
- Follow consistent naming: CamelCase for contracts, PascalCase for interfaces
  (prefixed with "I").
- Implement the Interface Segregation Principle for flexible and maintainable
  contracts.
- Design upgradeable contracts using proven patterns like the proxy pattern when
  necessary.
- Implement comprehensive events for all significant state changes.
- Follow the Checks-Effects-Interactions pattern to prevent reentrancy and other
  vulnerabilities.
- Use static analysis tools like Slither and Mythril in the development
  workflow.
- Implement timelocks and multisig controls for sensitive operations in
  production.
- Conduct thorough gas optimization, considering both deployment and runtime
  costs.
- Use OpenZeppelin's AccessControl for fine-grained permissions.
- Use Solidity 0.8.0+ for built-in overflow/underflow protection.
- Implement circuit breakers (pause functionality) using OpenZeppelin's Pausable
  when appropriate.
- Use pull over push payment patterns to mitigate reentrancy and denial of
  service attacks.
- Implement rate limiting for sensitive functions to prevent abuse.
- Use OpenZeppelin's SafeERC20 for interacting with ERC20 tokens.
- Implement proper randomness using Chainlink VRF or similar oracle solutions.
- Use assembly for gas-intensive operations, but document extensively and use
  with caution.
- Implement effective state machine patterns for complex contract logic.
- Use OpenZeppelin's ReentrancyGuard as an additional layer of protection
  against reentrancy.
- Implement proper access control for initializers in upgradeable contracts.
- Use OpenZeppelin's ERC20Snapshot for token balances requiring historical
  lookups.
- Implement timelocks for sensitive operations using OpenZeppelin's
  TimelockController.
- Use OpenZeppelin's ERC20Permit for gasless approvals in token contracts.
- Implement proper slippage protection for DEX-like functionalities.
- Use OpenZeppelin's ERC20Votes for governance token implementations.
- Implement effective storage patterns to optimize gas costs (e.g., packing
  variables).
- Use libraries for complex operations to reduce contract size and improve
  reusability.
- Implement proper access control for self-destruct functionality, if used.
- Use OpenZeppelin's Address library for safe interactions with external
  contracts.
- Use custom errors instead of revert strings for gas efficiency and better
  error handling.
- Implement NatSpec comments for all public and external functions.
- Use immutable variables for values set once at construction time.
- Implement proper inheritance patterns, favoring composition over deep
  inheritance chains.
- Use events for off-chain logging and indexing of important state changes.
- Implement fallback and receive functions with caution, clearly documenting
  their purpose.
- Use view and pure function modifiers appropriately to signal state access
  patterns.
- Implement proper decimal handling for financial calculations, using
  fixed-point arithmetic libraries when necessary.
- Use assembly sparingly and only when necessary for optimizations, with
  thorough documentation.
- Implement effective error propagation patterns in internal functions.
- Implement a comprehensive testing strategy
- Use property-based testing to uncover edge cases.
- Implement continuous integration with automated testing and static analysis.
- Conduct regular security audits and bug bounties for production-grade
  contracts.
- Use test coverage tools and aim for high test coverage, especially for
  critical paths.
- Optimize contracts for gas efficiency, considering storage layout and function
  optimization.
- Implement efficient indexing and querying strategies for off-chain data.

#### Typescript / React

- Don't use `accessKey` attribute on any HTML element.
- Don't set `aria-hidden="true"` on focusable elements.
- Don't add ARIA roles, states, and properties to elements that don't support
  them.
- Don't use distracting elements like `<marquee>` or `<blink>`.
- Only use the `scope` prop on `<th>` elements.
- Don't assign non-interactive ARIA roles to interactive HTML elements.
- Make sure label elements have text content and are associated with an input.
- Don't assign interactive ARIA roles to non-interactive HTML elements.
- Don't assign `tabIndex` to non-interactive HTML elements.
- Don't use positive integers for `tabIndex` property.
- Don't include "image", "picture", or "photo" in img `alt` prop.
- Don't use explicit role property that's the same as the implicit/default role.
- Make static elements with click handlers use a valid role attribute.
- Always include a `title` element for SVG elements.
- Give all elements requiring alt text meaningful information for screen
  readers.
- Make sure anchors have content that's accessible to screen readers.
- Assign `tabIndex` to non-interactive HTML elements with
  `aria-activedescendant`.
- Include all required ARIA attributes for elements with ARIA roles.
- Make sure ARIA properties are valid for the element's supported roles.
- Always include a `type` attribute for button elements.
- Make elements with interactive roles and handlers focusable.
- Give heading elements content that's accessible to screen readers (not hidden
  with `aria-hidden`).
- Always include a `lang` attribute on the html element.
- Always include a `title` attribute for iframe elements.
- Accompany `onClick` with at least one of: `onKeyUp`, `onKeyDown`, or
  `onKeyPress`.
- Accompany `onMouseOver`/`onMouseOut` with `onFocus`/`onBlur`.
- Include caption tracks for audio and video elements.
- Use semantic elements instead of role attributes in JSX.
- Make sure all anchors are valid and navigable.
- Ensure all ARIA properties (`aria-*`) are valid.
- Use valid, non-abstract ARIA roles for elements with ARIA roles.
- Use valid ARIA state and property values.
- Use valid values for the `autocomplete` attribute on input elements.
- Use correct ISO language/country codes for the `lang` attribute.
- Don't use consecutive spaces in regular expression literals.
- Don't use the `arguments` object.
- Don't use primitive type aliases or misleading types.
- Don't use the comma operator.
- Don't use empty type parameters in type aliases and interfaces.
- Don't write functions that exceed a given Cognitive Complexity score.
- Don't nest describe() blocks too deeply in test files.
- Don't use unnecessary boolean casts.
- Don't use unnecessary callbacks with flatMap.
- Use for...of statements instead of Array.forEach.
- Don't create classes that only have static members (like a static namespace).
- Don't use this and super in static contexts.
- Don't use unnecessary catch clauses.
- Don't use unnecessary constructors.
- Don't use unnecessary continue statements.
- Don't export empty modules that don't change anything.
- Don't use unnecessary escape sequences in regular expression literals.
- Don't use unnecessary fragments.
- Don't use unnecessary labels.
- Don't use unnecessary nested block statements.
- Don't rename imports, exports, and destructured assignments to the same name.
- Don't use unnecessary string or template literal concatenation.
- Don't use String.raw in template literals when there are no escape sequences.
- Don't use useless case statements in switch statements.
- Don't use ternary operators when simpler alternatives exist.
- Don't use useless `this` aliasing.
- Don't use any or unknown as type constraints.
- Don't initialize variables to undefined.
- Don't use void operators (they're not familiar).
- Use arrow functions instead of function expressions.
- Use Date.now() to get milliseconds since the Unix Epoch.
- Use .flatMap() instead of map().flat() when possible.
- Use literal property access instead of computed property access.
- Don't use parseInt() or Number.parseInt() when binary, octal, or hexadecimal
  literals work.
- Use concise optional chaining instead of chained logical expressions.
- Use regular expression literals instead of the RegExp constructor when
  possible.
- Don't use number literal object member names that aren't base 10 or use
  underscore separators.
- Remove redundant terms from logical expressions.
- Use while loops instead of for loops when you don't need initializer and
  update expressions.
- Don't pass children as props.
- Don't reassign const variables.
- Don't use constant expressions in conditions.
- Don't use `Math.min` and `Math.max` to clamp values when the result is
  constant.
- Don't return a value from a constructor.
- Don't use empty character classes in regular expression literals.
- Don't use empty destructuring patterns.
- Don't call global object properties as functions.
- Don't declare functions and vars that are accessible outside their block.
- Make sure builtins are correctly instantiated.
- Don't use super() incorrectly inside classes. Also check that super() is
  called in classes that extend other constructors.
- Don't use variables and function parameters before they're declared.
- Don't use \8 and \9 escape sequences in string literals.
- Don't use literal numbers that lose precision.
- Don't use the return value of React.render.
- Don't assign a value to itself.
- Don't return a value from a setter.
- Don't compare expressions that modify string case with non-compliant values.
- Don't use lexical declarations in switch clauses.
- Don't use variables that haven't been declared in the document.
- Don't write unreachable code.
- Make sure super() is called exactly once on every code path in a class
  constructor before this is accessed if the class has a superclass.
- Don't use control flow statements in finally blocks.
- Don't use optional chaining where undefined values aren't allowed.
- Don't have unused function parameters.
- Don't have unused imports.
- Don't have unused labels.
- Don't have unused private class members.
- Don't have unused variables.
- Make sure void (self-closing) elements don't have children.
- Don't return a value from a function that has a 'void' return type.
- Make sure all dependencies are correctly specified in React hooks.
- Make sure all React hooks are called from the top level of component
  functions.
- Use isNaN() when checking for NaN.
- Don't forget key props in iterators and collection literals.
- Make sure "for" loop update clauses move the counter in the right direction.
- Make sure typeof expressions are compared to valid values.
- Make sure generator functions contain yield.
- Don't use await inside loops.
- Don't use bitwise operators.
- Don't use expressions where the operation doesn't change the value.
- Don't destructure props inside JSX components in Solid projects.
- Make sure Promise-like statements are handled appropriately.
- Don't use **dirname and **filename in the global scope.
- Prevent import cycles.
- Don't define React components inside other components.
- Don't use event handlers on non-interactive elements.
- Don't assign to React component props.
- Don't use configured elements.
- Don't hardcode sensitive data like API keys and tokens.
- Don't let variable declarations shadow variables from outer scopes.
- Don't use the TypeScript directive @ts-ignore.
- Prevent duplicate polyfills from Polyfill.io.
- Don't use useless backreferences in regular expressions that always match
  empty strings.
- Don't use unnecessary escapes in string literals.
- Don't use useless undefined.
- Make sure getters and setters for the same property are next to each other in
  class and object definitions.
- Make sure object literals are declared consistently (defaults to explicit
  definitions).
- Use static Response methods instead of new Response() constructor when
  possible.
- Make sure switch-case statements are exhaustive.
- Make sure the `preconnect` attribute is used when using Google Fonts.
- Use `Array#{indexOf,lastIndexOf}()` instead of
  `Array#{findIndex,findLastIndex}()` when looking for the index of an item.
- Make sure iterable callbacks return consistent values.
- Use `with { type: "json" }` for JSON module imports.
- Use numeric separators in numeric literals.
- Use object spread instead of `Object.assign()` when constructing new objects.
- Always use the radix argument when using `parseInt()`.
- Make sure JSDoc comment lines start with a single asterisk, except for the
  first one.
- Include a description parameter for `Symbol()`.
- Don't use spread (`...`) syntax on accumulators.
- Don't use the `delete` operator.
- Don't access namespace imports dynamically.
- Don't use `<img>` elements in Next.js projects.
- Don't use namespace imports.
- Declare regex literals at the top level.
- Don't use `target="_blank"` without `rel="noopener"`.
- Don't use dangerous JSX props.
- Don't use both `children` and `dangerouslySetInnerHTML` props on the same
  element.
- Don't use global `eval()`.
- Don't use callbacks in asynchronous tests and hooks.
- Don't use TypeScript enums.
- Don't export imported variables.
- Don't use `<head>` elements in Next.js projects.
- Don't add type annotations to variables, parameters, and class properties that
  are initialized with literal expressions.
- Don't use TypeScript namespaces.
- Don't use negation in `if` statements that have `else` clauses.
- Don't use nested ternary expressions.
- Don't use non-null assertions with the `!` postfix operator.
- Don't reassign function parameters.
- Don't use parameter properties in class constructors.
- This rule lets you specify global variable names you don't want to use in your
  application.
- Don't use specified modules when loaded by import or require.
- Don't use user-defined types.
- Don't use constants whose value is the upper-case version of their name.
- Use `String.slice()` instead of `String.substr()` and `String.substring()`.
- Don't use template literals if you don't need interpolation or
  special-character handling.
- Don't use `else` blocks when the `if` block breaks early.
- Don't use yoda expressions.
- Don't use Array constructors.
- Use `as const` instead of literal types and type annotations.
- Use `at()` instead of integer index access.
- Follow curly brace conventions.
- Use `else if` instead of nested `if` statements in `else` clauses.
- Use single `if` statements instead of nested `if` clauses.
- Use either `T[]` or `Array<T>` consistently.
- Use `new` for all builtins except `String`, `Number`, and `Boolean`.
- Use consistent accessibility modifiers on class properties and methods.
- Use `const` declarations for variables that are only assigned once.
- Put default function parameters and optional function parameters last.
- Include a `default` clause in switch statements.
- Initialize each enum member value explicitly.
- Use the `**` operator instead of `Math.pow`.
- Use `export type` for types.
- Use `for-of` loops when you need the index to extract an item from the
  iterated array.
- Use `<>...</>` instead of `<Fragment>...</Fragment>`.
- Use `import type` for types.
- Make sure all enum members are literal values.
- Use `node:assert/strict` over `node:assert`.
- Use the `node:` protocol for Node.js builtin modules.
- Use Number properties instead of global ones.
- Don't add extra closing tags for components without children.
- Use assignment operator shorthand where possible.
- Use function types instead of object types with call signatures.
- Use template literals over string concatenation.
- Use `new` when throwing an error.
- Don't throw non-Error values.
- Use `String.trimStart()` and `String.trimEnd()` over `String.trimLeft()` and
  `String.trimRight()`.
- Use standard constants instead of approximated literals.
- Don't use Array index in keys.
- Don't assign values in expressions.
- Don't use async functions as Promise executors.
- Don't reassign exceptions in catch clauses.
- Don't reassign class members.
- Don't insert comments as text nodes.
- Don't compare against -0.
- Don't use labeled statements that aren't loops.
- Don't use void type outside of generic or return types.
- Don't use console.
- Don't use TypeScript const enum.
- Don't use control characters and escape sequences that match control
  characters in regular expression literals.
- Don't use debugger.
- Don't assign directly to document.cookie.
- Don't import next/document outside of pages/\_document.jsx in Next.js
  projects.
- Use `===` and `!==`.
- Don't use duplicate case labels.
- Don't use duplicate class members.
- Don't use duplicate conditions in if-else-if chains.
- Don't assign JSX properties multiple times.
- Don't use two keys with the same name inside objects.
- Don't use duplicate function parameter names.
- Don't have duplicate hooks in describe blocks.
- Don't use empty block statements and static blocks.
- Don't declare empty interfaces.
- Don't let variables evolve into any type through reassignments.
- Don't use the any type.
- Don't use export or module.exports in test files.
- Don't misuse the non-null assertion operator (!) in TypeScript files.
- Don't let switch clauses fall through.
- Don't use focused tests.
- Don't reassign function declarations.
- Don't allow assignments to native objects and read-only global variables.
- Use Number.isFinite instead of global isFinite.
- Use Number.isNaN instead of global isNaN.
- Don't use the next/head module in pages/\_document.js on Next.js projects.
- Don't use implicit any type on variable declarations.
- Don't assign to imported bindings.
- Don't use irregular whitespace characters.
- Don't use labels that share a name with a variable.
- Don't use characters made with multiple code points in character class syntax.
- Make sure to use new and constructor properly.
- Make sure the assertion function, like expect, is placed inside an it()
  function call.
- Don't use shorthand assign when the variable appears on both sides.
- Don't use octal escape sequences in string literals.
- Don't use Object.prototype builtins directly.
- Don't redeclare variables, functions, classes, and types in the same scope.
- Don't have redundant "use strict".
- Don't compare things where both sides are exactly the same.
- Don't let identifiers shadow restricted names.
- Don't use disabled tests.
- Don't use sparse arrays (arrays with holes).
- Watch out for possible "wrong" semicolons inside JSX elements.
- Don't use template literal placeholder syntax in regular strings.
- Don't use the then property.
- Don't merge interfaces and classes unsafely.
- Don't use unsafe negation.
- Don't use var.
- Don't use with statements in non-strict contexts.
- Don't use overload signatures that aren't next to each other.
- Make sure async functions actually use await.
- Make sure default clauses in switch statements come last.
- Make sure to pass a message value when creating a built-in error.
- Make sure get methods always return a value.
- Use a recommended display strategy with Google Fonts.
- Make sure for-in loops include an if statement.
- Use Array.isArray() instead of instanceof Array.
- Use the namespace keyword instead of the module keyword to declare TypeScript
  namespaces.
- Make sure to use the digits argument with Number#toFixed().
- Make sure to use the "use strict" directive in script files.

### Turborepo

- this is a tuborepo mono repo
- run all package.json scripts from the root so the correct pre/post and turbo
  dependencies run

### Package Manager: Bun (Default)

```bash
bun <file>            # instead of node/ts-node
bun install/run/test  # instead of npm/yarn/pnpm
# Auto-loads .env files (no dotenv needed)
```

### CLI Tools

- **jq**: JSON parsing (`brew install jq`)
- **yq**: YAML parsing (`brew install yq`)
- **ast-grep**: Syntax-aware search (`brew install ast-grep`)
  ```bash
  ast-grep --lang typescript -p 'function $NAME($_) { $$$ }'
  ```

### Git Commit & Branch Rules

#### Commit Format

`type(scope): description` (scope optional, description lowercase)

**Types:** feat, fix, chore, docs, style, refactor, perf, test, build, ci,
revert

#### Branch Rules (CRITICAL)

```bash
# Check current branch FIRST
current_branch=$(git branch --show-current)
[[ "$current_branch" == "main" || "$current_branch" == "master" ]] && git checkout -b feature/name || echo "Using: $current_branch"
```

✅ One feature = one branch = one PR ❌ NO nested branches or multiple PRs per
feature

#### Special Patterns

- Dependencies: `chore(deps):`, `fix(deps):`, `build(deps):`
- Breaking changes: `BREAKING CHANGE:` in body
- PR title = first commit message
- Error handling: `fix(error):`, `refactor(error):`
- Performance: `perf:`, `perf(table):`, `perf(render):`
- Logging: `refactor(logging):`, `fix(logging):`

#### Examples

##### General

- ✅ feat: add user authentication
- ✅ fix(api): resolve timeout issue
- ✅ chore(deps): update react to v18
- ✅ feat: redesign API endpoints
- ❌ Feature: Add user auth
- ❌ added new feature

#### Error Handling & Performance

- ✅ fix(error): replace console.log with createLogger
- ✅ refactor(error): add error boundary to data tables
- ✅ fix(toast): format validation errors for users
- ✅ perf(table): add url state persistence for filters
- ✅ perf(list): implement virtualization for large datasets
- ✅ perf: memoize expensive computations in dashboard
- ✅ refactor(state): migrate modal state from url to local
- ❌ fixed error handling
- ❌ performance improvements

### File Organization & Modularity

- Default to creating multiple small, focused files rather than large monolithic
  ones
- Each file should have a single responsibility and clear purpose
- Keep files under 350 lines when possible - split larger files by extracting
  utilities, constants, types, or logical components into separate modules
- Separate concerns: utilities, constants, types, components, and business logic
  into different files
- Prefer composition over inheritance - use inheritance only for true 'is-a'
  relationships, favor composition for 'has-a' or behavior mixing
- Follow existing project structure and conventions - place files in appropriate
  directories. Create new directories and move files if deemed appropriate.
- Use well defined sub-directories to keep things organized and scalable
- Structure projects with clear folder hierarchies and consistent naming
  conventions
- Import/export properly - design for reusability and maintainability

### Security First

- Never trust external inputs - validate everything at the boundaries
- Keep secrets in environment variables, never in code
- Log security events (login attempts, auth failures, rate limits, permission
  denials) but never log sensitive data (audio, conversation content, tokens,
  personal info)
- Authenticate users at the API gateway level - never trust client-side tokens
- Use Row Level Security (RLS) to enforce data isolation between users
- Design auth to work across all client types consistently
- Use secure authentication patterns for your platform
- Validate all authentication tokens server-side before creating sessions
- Sanitize all user inputs before storing or processing

### Error Handling

- Use specific exceptions over generic ones
- Always log errors with context
- Provide helpful error messages
- Fail securely - errors shouldn't reveal system internals

### Observable Systems & Logging Standards

- Every request needs a correlation ID for debugging
- Structure logs for machines, not humans - use JSON format with consistent
  fields (timestamp, level, correlation_id, event, context) for automated
  analysis
- Make debugging possible across service boundaries

### State Management

- Have one source of truth for each piece of state
- Make state changes explicit and traceable
- Design for multi-service voice processing - use session IDs for state
  coordination, avoid storing conversation data in server memory
- Keep conversation history lightweight (text, not audio)

### React best practices

- Treat UIs as a thin layer over your data. Skip local state (like useState)
  unless it’s absolutely needed and clearly separate from business logic. Choose
  variables and useRef if it doesn’t need to be reactive.
- Minimize usage of useEffect, derive all state where possible instead of using
  effects. Skip useMemo and useCallback, since the React Compiler will
  automatically handle memoization and optimization. Focus on deriving state
  from props and other state rather than using side effects.
- When you find yourself with nested if/else or complex conditional rendering,
  create a new component. Reserve inline ternaries for tiny, readable sections.
- Choose to derive data rather than use useEffect. Only use useEffect when you
  need to synchronize with an external system (e.g. document-level events). It
  causes misdirection of what the logic is doing. Choose to explicitly define
  logic rather than depend on implicit reactive behavior.
- Treat setTimeout as a last resort (and always comment why).
- IMPORTANT: do not add useless comments. Avoid adding comments unless you’re
  clarifying a race condition (setTimeout), a long-term TODO, or clarifying a
  confusing piece of code even a senior engineer wouldn’t initially understand.

### API Design Principles

- RESTful design with consistent URL patterns
- Use HTTP status codes correctly
- Version APIs from day one (/v1/, /v2/)
- Support pagination for list endpoints
- Use consistent JSON response format:
  - Success: `{ "data": {...}, "error": null }`
  - Error: `{ "data": null, "error": {"message": "...", "code": "..."} }`

## 4. MCP Server Integrations

### Context7 Documentation Server

**Repository**: [Context7 MCP Server](https://github.com/upstash/context7)

**When to use:**

- Working with external libraries/frameworks (React, FastAPI, Next.js, etc.)
- Need current documentation beyond training cutoff
- Implementing new integrations or features with third-party tools
- Troubleshooting library-specific issues

**Usage patterns:**

```js
// Resolve library name to Context7 ID
mcp__context7__resolve_library_id((libraryName = "react"));

// Fetch focused documentation
mcp__context7__get_library_docs(
  (context7CompatibleLibraryID = "/facebook/react"),
  (topic = "hooks"),
  (tokens = 8000)
);
```

**Key capabilities:**

- Up-to-date library documentation access
- Topic-focused documentation retrieval
- Support for specific library versions
- Integration with current development practices

### Ticket Management

- Use Linear to manage the metadata of a Linear ticket if you have been provided
  one. Do this when you start and during the lifecycle of your work/pr so we can
  keep track of progress.
- When tackling a task, search linear for similar issues and add them to your
  context. Also inspect linked github PR's for additional information.

### DeepWiki Documentation Server

**Repository**: [DeepWiki MCP Server](https://github.com/upstash/deepwiki)

**When to use:**

- Need in-depth, structured documentation for open source projects
- Want to explore repository wikis, architecture, or usage patterns
- Require answers to specific questions about a GitHub repository

**Usage patterns:**

```js
// List documentation topics for a GitHub repository
mcp_deepwiki_read_wiki_structure({ repoName: "facebook/react" });

// View documentation contents for a repository
mcp_deepwiki_read_wiki_contents({ repoName: "facebook/react" });

// Ask a question about a repository
mcp_deepwiki_ask_question({
  repoName: "facebook/react",
  question: "How does Suspense work?",
});
```

**Key capabilities:**

- Structured, topic-based documentation for GitHub repositories
- Semantic Q&A over repository docs and wikis
- Fast access to architecture, usage, and best practices

### Linear Project Management Server

**Service**: [Linear](https://linear.app/)

**When to use:**

- Manage project issues, tasks, and sprints
- Track progress and link PRs to tickets
- Automate project management workflows

**Usage patterns:**

```js
// Search or get a Linear issue
mcp_linear_list_issues({ query: "ENG-3236" });
mcp_linear_get_issue({ id: "ENG-3236" });

// Update an issue
mcp_linear_update_issue({ id, stateId, description });

// Comment on an issue
mcp_linear_create_comment({ issueId, body: "PR: https://..." });
```

**Key capabilities:**

- Issue and project tracking
- Integration with PRs and code reviews
- Automated status updates and comments

### Sentry Error Tracking Server

**Service**: [Sentry](https://sentry.io/)

**When to use:**

- Monitor and triage application errors and exceptions
- Investigate root causes and error trends
- Link errors to code changes and releases

**Usage patterns:**

```js
// Find unresolved issues in Sentry
mcp_sentry_find_organizations();
mcp_sentry_find_issues({ organizationSlug, query: "is:unresolved" });

// Get details for a specific issue
mcp_sentry_get_issue_details({ organizationSlug, issueId });

// Update issue status
mcp_sentry_update_issue({ organizationSlug, issueId, status });
```

**Key capabilities:**

- Real-time error and exception tracking
- Root cause analysis and alerting
- Integration with code and deployment workflows

## 5. Post-Task Completion Protocol

After completing any coding task, follow this checklist:

### 1. Type Safety & Quality Checks

Run the appropriate commands based on what was modified:

- **Python projects**: Run mypy type checking
- **TypeScript projects**: Run tsc --noEmit
- **Other languages**: Run appropriate linting/type checking tools

### 2. Verification

- Ensure all type checks pass before considering the task complete
- If type errors are found, fix them before marking the task as done
