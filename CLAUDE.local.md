# CLAUDE.local.md

<!-- 
ORGANIZATIONAL RULE STRUCTURE FOR CLAUDE CODE
=============================================
This file establishes the foundational rule architecture for Claude Code
across ALL SettleMint repositories. It provides:

1. RULE ORGANIZATION - Clear separation between global vs project-specific rules
2. CROSS-REPOSITORY CONSISTENCY - Ensures consistent development practices
3. MODULAR RULE SYSTEM - Each rule file has a specific purpose and scope
4. MCP INTEGRATION FRAMEWORK - Standardized external service integration

ARCHITECTURAL BENEFITS:
- CONSISTENCY: Same development standards across all SettleMint projects
- MAINTAINABILITY: Changes to global rules propagate to all repositories
- MODULARITY: Rules are separated by concern (git, qa, review, tools, etc.)
- EXTENSIBILITY: New rule categories can be added without breaking existing ones

This organizational approach ensures that improvements to development
practices benefit the entire SettleMint ecosystem, not just individual projects.

RULE HIERARCHY:
1. CLAUDE.local.md (this file) - Global organizational rules
2. CLAUDE.md - Project-specific rules and guidelines
3. .cursor/rules/*.mdc - Specialized rule modules
4. .claude/commands/*.md - Workflow automation commands
-->

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

These rules are global rules for the entire SettleMint organization and will be
copied over in every repository.

## Rules

<!-- 
MODULAR RULE SYSTEM REFERENCES
==============================
Each rule below references a specialized module that handles a specific
aspect of development. This modular approach provides:

1. SEPARATION OF CONCERNS - Each rule file has a single responsibility
2. MAINTAINABILITY - Updates to specific areas don't affect others  
3. REUSABILITY - Rules can be shared across different workflows
4. CLARITY - Developers know exactly where to find specific guidance

RULE MODULE PURPOSES:
- general.mdc: Core development principles and architectural guidance
- git.mdc: Version control, branching, and commit standards
- mcp.mdc: External service integration (Linear, Sentry, Context7, etc.)
- qa.mdc: Quality assurance and testing requirements
- review.mdc: PR review process and quality gates
- tools.mdc: CLI tooling, commands, and workflow automation
- typescript.mdc: Language-specific rules and patterns
-->

- Always keep in mind the general rules found in @.cursor/rules/general.mdc
- When interacting with git, gh and github, always use the
  @.cursor/rules/git.mdc
- You have access to the @.cursor/rules/mcp.mdc file, which contains information
  for interacting with the MCP servers.
- Before opening a PR, use the @.cursor/rules/qa.mdc and
  @.cursor/rules/review.mdc files to ensure the PR is of high quality.
- Your environment has access to some useful CLI tooling and Claude Commands,
  the description of them can be found in @.cursor/rules/tools.mdc
- We write predominately in typescript, so use the @.cursor/rules/typescript.mdc
