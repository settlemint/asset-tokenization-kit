# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

**⚠️ CRITICAL: AI agents MUST read the [./claude/CLAUDE.md](./claude/CLAUDE.md)
shared information before attempting any task to understand the project.**

## Memories

- Completely ignore dapp-v1 folder - it's deprecated
- Do not use vitest to make tests, use bun:test
- Asset types are centralized in the zod validator (no more cryptocurrency)
- Never use barrel files
- Do not use console.log, use createLogger with SETTLEMINT_LOG_LEVEL
- Do not modify code in kit/dapp/src/components/ui (shadcn components)
- NEVER, EVER commit to main, if you are not on a branch, make a new one
- Run `bun artifacts` and `bun codegen` before running any
  testing/linting/formatting tasks
- `routeTree.gen.ts` is auto generated, ignore it
- Before starting any work, run `bunx settlemint connect --instance local` and
  `bun run codegen`
- Always use error boundaries (DefaultCatchBoundary for routes,
  DataTableErrorBoundary for tables)
- Use toast notifications with formatValidationError for user feedback
- Prefer URL state for persistent UI configuration, local state for ephemeral
  interactions
- Only optimize performance after measuring with React DevTools Profiler
- Translations are organized into focused namespaces - use multiple namespaces
  in components as needed
- Tests are stored next to the route/component/file, not in a `__tests__` folder
- During refactors, if you encounter barrel files, remove them
- Do not store temporary analysis md files, and if you absolutely need to, make
  sure to clean them up before committing
- Never pass around `t` from the translations hook, if you cannot get `t` into a
  function, you shouldn't use such a function
- Use full types when possible, e.g. User and not { role?: string } if you just
  need the role
- Never use eslint-disable comments, fix the issues for real
- `as any` is NEVER allowed!
