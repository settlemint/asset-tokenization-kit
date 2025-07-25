# /code-review

Perform a comprehensive code review of changes in the current PR, branch, or uncommitted changes.

## Execution

Invoke the code-reviewer agent using:

```javascript
Task({
  description: "Code review",
  subagent_type: "code-reviewer", 
  prompt: `Review the current changes (uncommitted, branch, or PR) with focus on:
    - Security vulnerabilities and risks
    - Performance optimizations
    - Code quality and maintainability
    - Compliance with project standards
    - Bug detection and prevention
    
    Use Gemini-CLI for additional insights on complex changes.
    Apply any approved learnings from previous reviews.
    Wait for Forge compilation if reviewing Solidity contracts.`
})
```

## What the Agent Does

1. **Context Gathering**: Analyzes all changed files, dependencies, and project standards
2. **Gemini Enhancement**: Gets additional insights using Gemini-CLI for pattern detection
3. **Systematic Review**: Checks security, performance, bugs, architecture, and code quality
4. **Learning Application**: Applies previously approved patterns and best practices
5. **Report Generation**: Delivers prioritized, actionable feedback

## Self-Learning

The agent can identify patterns and propose learnings for future reviews. You'll be asked to approve any new patterns before they're integrated into the agent's knowledge base.
