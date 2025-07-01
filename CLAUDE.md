# CLAUDE.md

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
- Run `bun artifacts` and `bun codegen` before running any
  testing/linting/formatting tasks
- `routeTree.gen.ts` is auto generated, ignore it
