---
name: review
description: Manually trigger comprehensive code review of current changes
---

# Code Review Command

Manually triggers the code-reviewer agent to perform a comprehensive review of all current changes including unstaged, staged, and branch commits.

## Usage

```
/review
```

## What it does

The code-reviewer agent will autonomously:

1. Gather repository and branch context
2. Identify the base branch and collect all diffs (unstaged, staged, branch commits)
3. Fetch PR context and comments if a PR exists
4. Search for linked Linear tickets in commit messages
5. Fetch latest documentation for referenced libraries (Context7)
6. Search for best practices and common pitfalls (WebSearch)
7. Analyze historical context and check for regressions
8. Perform multi-model collaboration if available (Gemini, GPT-5)
9. Use ultrathink for complex logic, security, and edge cases
10. Output comprehensive review with confidence scores

## Output includes

- **Review Confidence Score**: Context completeness, analysis depth, validation status
- **Process Checklist**: Shows all completed review steps
- **Code Review Summary**: Strengths and issues found
- **Critical Issues**: Must-fix bugs, security flaws
- **Important Findings**: Performance and maintainability issues
- **Suggestions**: Style and minor optimizations
- **Specific Fix Templates**: Before/after code with explanations
- **Actionable Task List**: Prioritized fixes with file locations

## When to use

- Before creating a pull request
- After implementing any feature or fix
- When you want comprehensive code quality analysis
- Before merging to main branch
- After significant refactoring

## Note

The agent runs completely autonomously and does not accept parameters. It will analyze ALL current changes in your repository and provide a comprehensive review based on its built-in checklist and criteria.