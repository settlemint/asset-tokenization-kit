# /pr

Creates a high-quality pull request using multi-agent analysis.

## Auto-Loaded Context

- @/CLAUDE.md
- @/.claude/CLAUDE.md

## Behavior

- Create feature branch if on main
- Format files: `bun run format`
- Analyze and split changes into logical commits
- Push branch
- Create PR with summary and test plan

## Parallel Agents

Use concurrent agents for efficiency:

1. **Analysis**: Suggest commit splits
2. **Commit**: Create commits with messages
3. **Description**: Generate PR content
4. **Quality**: Run checks

Agents sync before PR creation.

## Commit Splitting Guidelines

- By feature/component
- Group related files
- Separate refactors from features
- Independent commits
- Split unrelated changes

## Pre-flight Checks

### Branch Check (CRITICAL)

```bash
current_branch=$(git branch --show-current)
[[ "$current_branch" == "main" || "$current_branch" == "master" ]] && git checkout -b feature/name || echo "Using: $current_branch"
```

### Status Check

```bash
[ -n "$(git status --porcelain)" ] && echo "Commit changes first"
```

### Quality Gates

```bash
bun run ci  # Must pass
```

## Post-Creation

Link to Linear:

```bash
mcp_linear_create_comment({issueId: "$LINEAR_TICKET", body: "PR: $PR_URL"})
```

## Escape Hatches

1. **Conflicts**: Rebase or merge main
2. **Breaking Changes**: Document migrations
3. **Test Failures**: Fix before PR

## Quality Checklist

- [ ] Semantic commits
- [ ] PR description
- [ ] Tests pass
- [ ] Docs complete
- [ ] No vulnerabilities
- [ ] Performance assessed
- [ ] Breaking changes doc'd
- [ ] Reviewers assigned
- [ ] Ticket linked
- [ ] CI green
