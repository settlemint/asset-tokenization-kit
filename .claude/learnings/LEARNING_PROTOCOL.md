# Agent Self-Learning Protocol

## Overview

This protocol enables Claude Code agents to learn and improve from experience while maintaining user control over what constitutes accepted practices.

## Learning Workflow

### 1. Pattern Detection
During agent execution, identify:
- Recurring issues and their solutions
- Project-specific conventions discovered
- Performance optimizations that work
- Team preferences observed
- Successful debugging strategies

### 2. Learning Capture
Create structured entries in agent-specific learning files:
- `code-review-learnings.md` - Code review patterns
- `debug-learnings.md` - Debugging strategies  
- `test-learnings.md` - Testing patterns
- `pr-learnings.md` - PR/commit best practices

### 3. User Approval Process

```markdown
🧠 **Proposed Learning**
I've identified a pattern that could improve future [reviews/debugging/testing]:

**Pattern**: [Description]
**Context**: [When this applies]  
**Evidence**: [Where this was observed]
**Recommendation**: [Proposed approach]

Would you like me to:
1. ✅ Add this to my permanent knowledge
2. 🔄 Apply only for this session
3. ❌ Ignore this pattern
```

### 4. Knowledge Integration

Approved learnings are:
1. Stored in the learning files with approval timestamp
2. Loaded at agent startup for future sessions
3. Periodically consolidated into CLAUDE.md updates
4. Shared across team members via version control

## Learning Categories

### Code Review Learnings
- Security vulnerabilities specific to your stack
- Performance anti-patterns in your codebase
- Team-specific style preferences
- Common PR feedback patterns

### Debug Learnings  
- Environment-specific issues and solutions
- Debugging strategies that work for your stack
- Common root causes in your system
- Effective troubleshooting sequences

### Test Learnings
- Flaky test patterns and fixes
- Optimal test execution order
- Environment setup requirements
- Coverage blind spots

### PR/Commit Learnings
- Team's commit message preferences
- PR description templates that work
- Review turnaround patterns
- CI/CD quirks and optimizations

## Privacy & Control

- Learnings are stored locally in your repository
- Nothing is shared without explicit approval
- You can edit/delete learnings at any time
- Learnings can be team-specific or personal

## Implementation

Each agent checks for applicable learnings at startup:

```javascript
async function loadLearnings(agentType) {
  const learningsFile = `.claude/learnings/${agentType}-learnings.md`;
  const approvedLearnings = parseApprovedLearnings(learningsFile);
  return approvedLearnings.filter(l => l.userApproved === 'Yes');
}
```

## Benefits

1. **Continuous Improvement**: Agents get better over time
2. **Team Knowledge**: Capture institutional knowledge
3. **Consistency**: Apply learned patterns consistently
4. **Efficiency**: Avoid re-discovering solutions
5. **Customization**: Tailor agents to your specific needs