# CLAUDE.local.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

These rules are global rules for the entire SettleMint organization and will be
copied over in every repository.

## Rules

- Always keep in mind the general rules found in @.cursor/rules/general.mdc
- When interacting with git, gh and github, always use the
  @.cursor/rules/git.mdc
- You have access to the @.cursor/rules/mpc.mdc file, which contains information
  for interacting with the MCP servers.
- Before opening a PR, use the @.cursor/rules/qa.mdc and
  @.cursor/rules/review.mdc files to ensure the PR is of high quality.
- Your environment has access to some useful CLI tooling and Claude Commands,
  the description of them can be found in @.cursor/rules/tools.mdc
- We write predominately in typescript, so use the @.cursor/rules/ultracite.mdc
- For error handling and performance patterns specific to this project, refer to
  @.cursor/rules/error-handling-performance.mdc
- Do not add comments for the user to files in @.cursor/rules,
  @.claude/commands, CLAUDE.md or CLAUDE.local.md, it's for the agent to use, do
  add more information for agents if needed.
- You cannot run `bun dev`, it is a long running process that will block your
  state.
- Make sure to ask me for any additional information you need to implement any
  functionality or fix any issues.
- CRITICAL: NEVER COMMIT TO THE MAIN BRANCH, ALWAYS PUSH TO A FEATURE BRANCH.
  More info in @.cursor/rules/git.mdc
- Adding `as any` is NEVER the solution
