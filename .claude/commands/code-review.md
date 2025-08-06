# /code-review

Review code for quality, security, and best practices.

## Review Process

1. Use code-reviewer agent for general review
2. Use solidity-auditor agent for smart contracts
3. Run quality checks locally

## Quality Checks

```bash
bun run lint        # Linting
bun run test        # Tests
bun run typecheck   # TypeScript
```

## Review Focus

- Architecture patterns
- Security vulnerabilities
- Performance bottlenecks
- Test coverage
- Error handling
- Code readability

## Output Format

```markdown
✅ Strengths: [what's good] ⚠️ Issues: [problems found] 🔧 Actions: [specific
fixes]
```
