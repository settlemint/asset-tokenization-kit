# /code-review

Performs fast, focused code review using concurrent agents to catch critical
bugs, security issues, and optimizations.

## Auto-Loaded Context

- @/CLAUDE.md
- @/.claude/CLAUDE.md
- @/docs/ai-context/project-structure.md
- @/docs/ai-context/docs-overview.md

## Philosophy

Prioritize high-impact findings: reliability, security, performance,
scalability. Exclude minor issues.

## Execution

User context: "$ARGUMENTS"

## Step 1: Parse Intent

Determine scope (files, features) and focus (e.g., security). Read relevant docs
for context.

## Step 2: Concurrent Agents

Launch 4 parallel agents:

1. **Bug Hunter**: Detects logic errors, edge cases.
2. **Security Scanner**: Finds vulnerabilities, auth issues.
3. **Performance Analyzer**: Spots bottlenecks, inefficiencies.
4. **Quality Inspector**: Checks maintainability, debt.

Each analyzes assigned areas, focusing on critical impacts.

## Step 3: Synthesize

Filter for high-impact issues. Quantify risks and ROIs.

## Minimal Output

```markdown
# Code Review Summary

## 🚨 Critical Issues

- Issue: [desc] | Location: [file:line] | Fix: [snippet]

## 🎯 Improvements

- Improvement: [desc] | ROI: [benefit]

## Action Plan

1. Fix criticals
2. Apply improvements
```

## Follow-up

Offer to fix issues or generate tests.

## Error Handling

- Ambiguous input: Search codebase
- Gaps: Add agents if needed"
