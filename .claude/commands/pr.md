# /pr

Create a high-quality pull request using multi-agent analysis.

## Linear Context Gathering

Before creating PR, gather Linear context:

```javascript
// 1. Find my active issues
mcp__linear__list_my_issues({
  limit: 10,
  orderBy: "updatedAt"
})

// 2. Check issue details and linked PRs
mcp__linear__get_issue({
  id: "ISSUE-123"
})

// 3. Review similar completed issues
mcp__linear__list_issues({
  organizationSlug: "your-org",
  stateId: "done-state-id",
  query: "similar feature keywords",
  limit: 5
})
```

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

### Gemini-CLI PR Enhancement

Leverage gemini-cli for intelligent PR creation:

1. **Change Analysis & Commit Strategy**:
   ```javascript
   mcp__gemini-cli__ask-gemini({
     prompt: "@git-diff analyze changes and suggest logical commit splits with semantic messages",
     changeMode: true,
     model: "gemini-2.5-pro"
   })
   ```

2. **PR Description Generation**:
   ```javascript
   mcp__gemini-cli__ask-gemini({
     prompt: "@commits generate comprehensive PR description with summary, changes, and test plan",
     changeMode: true
   })
   ```

3. **Breaking Change Detection**:
   ```javascript
   mcp__gemini-cli__ask-gemini({
     prompt: "@changes identify breaking changes and suggest migration guide",
     changeMode: true,
     sandbox: true
   })
   ```

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

### Database Migration Handling

**IMPORTANT**: If PR includes database schema changes:
1. Check for multiple migration files in `kit/dapp/src/lib/db/migrations/`
2. Squash all new migrations into a single migration file to maintain clean history
3. Ensure migration is properly tested with:
   ```bash
   bun run db:migrate  # Apply migrations
   bun run db:check   # Verify migration integrity
   ```

## Post-Creation

### Linear Integration

Comprehensive Linear integration for PR tracking:

1. **Find Related Issues**:
   ```javascript
   mcp__linear__list_issues({
     organizationSlug: "your-org",
     query: "feature name or bug description",
     limit: 10
   })
   ```

2. **Link PR to Issue**:
   ```javascript
   mcp__linear__create_comment({
     issueId: "ISSUE-123",
     body: "🚀 PR Created: [#PR-NUMBER](PR_URL)\n\n**Changes:**\n- Feature implementation\n- Tests added\n- Documentation updated"
   })
   ```

3. **Update Issue Status**:
   ```javascript
   mcp__linear__update_issue({
     id: "ISSUE-123",
     stateId: "in-review-state-id"
   })
   ```

4. **Create PR Checklist**:
   ```javascript
   mcp__linear__create_comment({
     issueId: "ISSUE-123",
     body: "## PR Checklist\n- [ ] Code review passed\n- [ ] Tests green\n- [ ] Documentation updated\n- [ ] Breaking changes documented"
   })
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
- [ ] README.md files updated
- [ ] CLAUDE.md patterns documented
- [ ] Database migrations squashed (if applicable)

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

## Gemini-CLI PR Intelligence

Advanced PR capabilities with gemini-cli:

### 1. **Commit Message Optimization**
```javascript
mcp__gemini-cli__ask-gemini({
  prompt: "Generate semantic commit message for @staged-changes following conventional commits",
  changeMode: true,
  model: "gemini-2.5-flash"
})
```

### 2. **PR Review Prediction**
```javascript
mcp__gemini-cli__brainstorm({
  prompt: "Predict potential review comments for this PR based on changes",
  domain: "software",
  constraints: "Focus on security, performance, and code quality issues",
  ideaCount: 10,
  includeAnalysis: true
})
```

### 3. **Test Plan Generation**
```javascript
mcp__gemini-cli__ask-gemini({
  prompt: "@pr-changes generate comprehensive test plan with manual and automated steps",
  changeMode: true
})
```

### 4. **Documentation Updates**
```javascript
mcp__gemini-cli__ask-gemini({
  prompt: "@code-changes identify required documentation updates and generate content",
  changeMode: true
})

// Check for documentation created by agents
mcp__gemini-cli__ask-gemini({
  prompt: "@README.md @CLAUDE.md verify documentation is complete and accurate",
  changeMode: false
})

// Verify README files are comprehensive
mcp__gemini-cli__ask-gemini({
  prompt: "@*/README.md check for clear overview, examples, and getting started sections",
  changeMode: false
})
```

### 5. **Dependency Impact Analysis**
```javascript
mcp__gemini-cli__ask-gemini({
  prompt: "@package.json analyze dependency changes for security and compatibility",
  changeMode: false
})
```

### 6. **PR Title Optimization**
```javascript
mcp__gemini-cli__ask-gemini({
  prompt: "@commits generate concise PR title that captures main value proposition",
  changeMode: false
})
```

## Learned PR Patterns

<!-- AI appends patterns here -->
<!-- Format: ### Pattern Name
     Context: When this applies
     Convention: What the team prefers
     Example: Specific instance
     Automation: How to apply automatically -->
