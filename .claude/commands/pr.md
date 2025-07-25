# /pr

Create and manage pull requests with high-quality commits and descriptions.

## Execution

Invoke the pr-commit-manager agent using:

```javascript
Task({
  description: "Create PR", 
  subagent_type: "pr-commit-manager",
  prompt: `Create a pull request for the current changes:
    - Ensure we're on a feature branch (create if on main)
    - Run quality gates (format, lint, tests)
    - Analyze changes and create logical, atomic commits
    - Write semantic commit messages following team conventions
    - Generate comprehensive PR description with screenshots if UI changes
    - Link to relevant Linear tickets if available
    - Apply learned commit/PR patterns from team preferences
    - Monitor CI pipeline and handle any failures`
})
```

## What the Agent Does

1. **Branch Safety**: Creates feature branch if needed
2. **Quality Gates**: Ensures code passes all checks before PR
3. **Smart Commits**: Creates logical, atomic commits with semantic messages
4. **PR Generation**: Creates detailed description with checklist
5. **CI Monitoring**: Watches pipeline and fixes issues
6. **Review Management**: Handles feedback and updates

## Self-Learning

The agent learns from your team's preferences:
- Commit message style and conventions
- PR description templates that work
- Review turnaround patterns
- Common CI fixes
