# /pr

Create a high-quality pull request using multi-agent analysis.

## Behavior

- Create feature branch if on main
- Format files: `bun run format`
- Analyze and split changes into logical commits with semantic messages
  (type(scope): description)
- Types: feat, fix, chore, docs, style, refactor, perf, test, build, ci, revert
- Push branch
- Create PR with title describing the most important changes (for squash merges)
- Include summary and test plan

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

# Self-Learning & PR Patterns

## Automatic Learning Capture

During PR creation, silently learn and document:

1. **Commit Patterns**: How this team structures commits
2. **PR Conventions**: Title/description preferences
3. **Review Feedback**: Common review comments to preempt
4. **CI Failures**: Typical CI issues and fixes
5. **Workflow Optimizations**: Efficient PR processes

## Integration Approach

- Append learnings to this file under "Learned PR Patterns"
- Update CLAUDE.md for project-wide conventions
- No user interruption - changes reviewed in PR
- Focus on actionable improvements

## Learned PR Patterns

<!-- AI appends patterns here -->
<!-- Format: ### Pattern Name
     Context: When this applies
     Convention: What the team prefers
     Example: Specific instance
     Automation: How to apply automatically -->
