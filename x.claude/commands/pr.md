# /pr

Create pull request with quality checks and Linear integration.

## Workflow

```bash
# 1. Branch check (exit main)
[[ "$(git branch --show-current)" =~ ^(main|master)$ ]] && git checkout -b feature/name

# 2. Quality gates
bun run ci  # MUST pass

# 3. Create PR
gh pr create --title "type(scope): description" --body "..."
```

## Commit Guidelines

- Semantic format: `type(scope): description`
- Types: feat, fix, chore, docs, refactor, test
- Split by feature/component
- Squash DB migrations if multiple

## Linear Integration

<example>
# Find related issues
mcp__linear__list_issues({ query: "feature name" })

# Link PR to issue

mcp**linear**create_comment({ issueId: "ISSUE-123", body: "PR: [#123](url)" })

# Update status

mcp**linear**update_issue({ id: "ISSUE-123", stateId: "in-review" }) </example>

## Checklist

- [ ] Tests pass
- [ ] Semantic commits
- [ ] PR description complete
- [ ] Linear issue linked
- [ ] CI green
