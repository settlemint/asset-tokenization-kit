# Code Style and Conventions

## TypeScript Configuration
- **Strict Mode**: All strict flags enabled
  - `strict: true`
  - `strictNullChecks: true`
  - `noUncheckedIndexedAccess: true`
  - `noImplicitOverride: true`
  - `noUnusedLocals: true`
  - `noUnusedParameters: true`
- **Module Resolution**: `bundler` mode with ESM-first approach
- **Target**: ES2022
- **Path Aliases**:
  - `@/*` → `./src/*`
  - `@schemas/*` → `./*.d.ts`
  - `@test/*` → `./test/*`
  - `@atk/*` → `../../packages/*`

## Formatting (Prettier)
- **Indentation**: 2 spaces (default for all except Python which uses 4)
- **Semicolons**: Always (`semi: true`)
- **Quotes**: Single quotes for strings
- **Trailing Commas**: ES5 style (`trailingComma: "es5"`)
- **Arrow Parens**: Always include (`arrowParens: "always"`)
- **Prose Wrap**: Always wrap markdown (`proseWrap: "always"`)

## Linting (ESLint)
- **Max Warnings**: 0 (strict enforcement)
- **React-specific rules** enabled
- **Boundaries plugin** for package isolation
- **Cache enabled** for performance

## Component Patterns
- **Functional Components**: Use hooks, avoid class components
- **Composition over Inheritance**
- **Server Components by default** (Next.js App Router)
- **'use client' directive** only for interactive components

## File Organization
- **Colocate tests**: `*.test.ts(x)` files next to source
- **Integration tests**: In `test/` directory
- **Fixtures**: In `test/fixtures/`
- **Generated files**: Marked with `*.gen.ts` or in `.generated/`

## Naming Conventions
- **Files**: kebab-case for files and directories
- **Components**: PascalCase for React components
- **Functions/Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Types/Interfaces**: PascalCase, prefix with 'I' for interfaces when needed

## Best Practices
- **Type Inference**: Leverage over explicit annotations where possible
- **Zod Schemas**: Use for runtime validation with `z.infer<>` for types
- **Error Handling**: Use typed errors with Viem
- **Immutability**: Treat props and parameters as immutable
- **Early Returns**: Prefer over nested conditionals