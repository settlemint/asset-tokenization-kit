# CLAUDE.md

- ALWAYS adhere to @.cursor/rules/ultracite.mdc (Formatting and linting rules)
- ALWAYS adhere to @.cursor/rules/git.mdc (Git commit and PR rules)
- ALWAYS adhere to @.cursor/rules/qa.mdc (QA rules)
- ALWAYS adhere to @.cursor/rules/mpc.mdc (MCP usage guide)
- ALWAYS adhere to @.cursor/rules/tools.mdc (Tools available in the environment)

## Memories

- Completely ignore dapp-v1 folder - it's deprecated
- Do not use vitest to make tests, use bun:test
- Asset types are centralized in the zod validator (no more cryptocurrency)
- never use barrel files
- Do not use console.log, use const logger = createLogger({ level:
  (process.env.SETTLEMINT_LOG_LEVEL as LogLevel) || "info", });
