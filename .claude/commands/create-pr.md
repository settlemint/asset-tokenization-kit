# /create-pr

*Creates a comprehensive pull request using multi-agent analysis to ensure high-quality submissions that minimize reviewer burden*

## Auto-Loaded Project Context:
@/CLAUDE.md
@/.claude/CLAUDE.md
@/docs/ai-context/project-structure.md
@/docs/ai-context/docs-overview.md

## Role: Release Manager

You are acting as a **Release Manager** with expertise in:

- Semantic versioning and conventional commits
- Code review best practices
- Change impact analysis
- Documentation and testing standards
- Stakeholder communication
- DevOps and CI/CD pipelines

Your release philosophy:

- "A good PR tells a story"
- "Minimize reviewer cognitive load"
- "Every change must be traceable"
- "Quality gates prevent production issues"

## Command Execution Flow

User provided context: "$ARGUMENTS"

## Step 1: Analyze PR Scope and Select Strategy

Think deeply about the changes made:
- Number of files modified
- Types of changes (features, fixes, refactoring)
- Potential impact on existing functionality
- Testing requirements
- Documentation needs

### Strategy Selection:

**🎯 Direct Approach** (0-1 sub-agents)
- Simple bug fixes or minor changes
- Single file modifications
- No architectural impact
- Clear, isolated changes

**⚡ Focused Analysis** (2-3 sub-agents)
- Multi-file feature additions
- Moderate refactoring
- Clear component boundaries
- Standard testing requirements

**🚨 Comprehensive Analysis** (4+ sub-agents)
- Major features or breaking changes
- Cross-system impact
- Complex refactoring
- Performance or security implications

## Step 2: Execute Multi-Agent PR Analysis

**CRITICAL:** Generate specialized agents based on the PR scope. All agents must work in parallel for efficiency.

### Dynamic Agent Allocation Pattern:

```
Small PR (1-5 files): 2 agents (Change Analyzer, PR Writer)
Medium PR (6-15 files): 3-4 agents (+ Test Validator, Impact Assessor)
Large PR (16+ files): 5+ agents (+ specialized domain experts)
```

### Core Agent Templates:

#### Agent 1: Change Analyzer
```
Task: "As a Change Analysis Specialist, comprehensively catalog and categorize all modifications in this PR.

MANDATORY COVERAGE CHECKLIST:
☐ File-by-file change summary
☐ Change type classification (feat/fix/refactor/etc)
☐ Lines added/removed statistics
☐ Dependency changes
☐ Breaking change detection
☐ API surface modifications

Workflow:
1. Run git diff --stat for overview
2. Analyze each file's changes with git diff
3. Identify patterns and groupings
4. Check for breaking changes
5. Return structured change report with semantic categorization"
```

#### Agent 2: Test Coverage Validator
```
Task: "As a Test Coverage Specialist, verify comprehensive test coverage for all changes.

MANDATORY COVERAGE CHECKLIST:
☐ New tests for new features
☐ Updated tests for modified code
☐ Integration test coverage
☐ E2E test scenarios
☐ Edge case handling
☐ Performance test requirements

Workflow:
1. Map changed files to test files
2. Verify test execution with bun run ci
3. Analyze coverage reports
4. Identify gaps in test coverage
5. Return test adequacy assessment"
```

#### Agent 3: Documentation Auditor
```
Task: "As a Documentation Specialist, ensure all changes are properly documented.

MANDATORY COVERAGE CHECKLIST:
☐ Code comments for complex logic
☐ Updated API documentation
☐ README changes if needed
☐ Migration guides for breaking changes
☐ Changelog entries
☐ Inline documentation

Workflow:
1. Review changed files for documentation needs
2. Check for outdated docs due to changes
3. Verify JSDoc/TSDoc completeness
4. Assess user-facing documentation
5. Return documentation compliance report"
```

#### Agent 4: Impact Assessor
```
Task: "As an Impact Analysis Expert, evaluate the blast radius and risks of these changes.

MANDATORY COVERAGE CHECKLIST:
☐ Downstream dependency analysis
☐ Performance implications
☐ Security considerations
☐ Database migration needs
☐ API compatibility
☐ User experience impact

Workflow:
1. Trace usage of modified components
2. Analyze performance characteristics
3. Review security implications
4. Check for data model changes
5. Return comprehensive impact assessment"
```

#### Agent 5: PR Description Writer
```
Task: "As a Technical Writer, create a compelling PR description that tells the story of these changes.

MANDATORY SECTIONS:
☐ Executive summary
☐ Motivation and context
☐ Technical implementation details
☐ Testing approach and results
☐ Screenshots/demos (if applicable)
☐ Migration instructions
☐ Reviewer guidance

Workflow:
1. Synthesize all agent reports
2. Create narrative flow
3. Add technical details
4. Include visual aids
5. Return formatted PR description"
```

## Step 3: Pre-flight Checks

### Branch Verification (CRITICAL)

```bash
# Check current branch FIRST
current_branch=$(git branch --show-current)
if [[ "$current_branch" == "main" || "$current_branch" == "master" ]]; then
    echo "ERROR: On main branch. Creating feature branch..."
    # Generate branch name from changes
    git checkout -b feature/descriptive-name
else
    echo "✅ Using branch: $current_branch"
fi
```

### Working Directory Status

```bash
# Ensure all changes are committed
git status --porcelain
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Uncommitted changes detected"
    # Stage and commit changes
fi
```

### Quality Gates

```bash
# Run full test suite
bun run ci
# Must pass ALL checks before proceeding
```

## Step 4: Create Semantic Commits

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

### Multi-Commit Strategy

For complex PRs, create logical commit sequence:

```bash
# Example commit sequence
git commit -m "refactor(auth): extract authentication logic"
git commit -m "feat(auth): add OAuth2 provider support"
git commit -m "test(auth): add OAuth2 integration tests"
git commit -m "docs(auth): update authentication guide"
```

## Step 5: Push and Create PR

### Push to Remote

```bash
# Push with upstream tracking
git push -u origin $(git branch --show-current)
```

### Create Pull Request

```bash
# Use gh CLI with comprehensive description
gh pr create \
  --title "$SEMANTIC_TITLE" \
  --body "$(cat <<'EOF'
## 🎯 Summary

$EXECUTIVE_SUMMARY

## 💡 Motivation and Context

$WHY_THESE_CHANGES

## 🔧 Technical Implementation

$TECHNICAL_DETAILS

### Key Changes:
$CHANGE_LIST

## 🧪 Testing

$TEST_APPROACH

### Test Results:
- ✅ Unit tests: 100% pass
- ✅ Integration tests: 100% pass
- ✅ E2E tests: 100% pass
- ✅ Performance: No regression

## 📸 Screenshots/Demo

$VISUAL_AIDS

## 🚀 Deployment Notes

$DEPLOYMENT_CONSIDERATIONS

## 📝 Checklist

- [x] Code follows project style guidelines
- [x] Tests cover all new/modified code
- [x] Documentation updated
- [x] No security vulnerabilities introduced
- [x] Performance impact assessed
- [x] Breaking changes documented

## 🔗 Related Issues

Closes #$ISSUE_NUMBERS

## 👀 Reviewer Guidance

$REVIEW_FOCUS_AREAS

EOF
)"
```

## Step 6: Post-Creation Tasks

### Link to Linear

```bash
# Update Linear ticket with PR link
mcp_linear_create_comment({
    issueId: "$LINEAR_TICKET",
    body: "PR created: $PR_URL"
})
```

### Notify Stakeholders

- Add reviewers based on CODEOWNERS
- Tag relevant team members
- Update project board

## Structured Output Format

```markdown
## PR Creation Summary

### 📋 PR Details
- **Title:** `feat(component): add real-time updates`
- **Branch:** `feature/real-time-updates`
- **URL:** https://github.com/org/repo/pull/123
- **Linear Ticket:** ENG-4567

### 📊 Change Metrics
- **Files Changed:** 12
- **Lines Added:** +340
- **Lines Removed:** -85
- **Test Coverage:** 94.2%

### 🎯 Key Changes
1. ✅ WebSocket integration for real-time data
2. ✅ State management refactoring
3. ✅ Performance optimizations
4. ✅ Comprehensive test suite

### 🔍 Quality Status
| Check | Status | Details |
|-------|--------|---------|
| Tests | ✅ PASS | All 234 tests passing |
| Lint | ✅ PASS | No issues found |
| Types | ✅ PASS | No type errors |
| Build | ✅ PASS | Build successful |
| Coverage | ✅ PASS | 94.2% (threshold: 80%) |

### 📝 Documentation
- API docs: ✅ Updated
- README: ✅ Updated
- Migration guide: ✅ Created
- Changelog: ✅ Entry added

### ⚠️ Reviewer Notes
- **Focus Areas:** WebSocket error handling, state synchronization
- **Performance:** Tested with 10k concurrent connections
- **Breaking Changes:** None

### 🚀 Next Steps
1. Await code review feedback
2. Address any requested changes
3. Ensure CI/CD pipeline passes
4. Coordinate deployment with DevOps
```

## Escape Hatches

### When PR Creation is Complex:

1. **Merge Conflicts**
   - "Detected conflicts with target branch"
   - Option A: Rebase onto latest main
   - Option B: Merge main into feature branch
   - Option C: Create new branch from main
   - Ask: "How would you like to resolve conflicts?"

2. **Large PR Scope**
   - "PR contains [X] files with [Y] changes"
   - "Consider splitting into multiple PRs:"
   - Option A: Keep as single atomic change
   - Option B: Split by feature area
   - Option C: Create PR stack
   - Ask: "Should I split this PR?"

3. **Breaking Changes**
   - "Detected breaking changes in API"
   - Document migration path
   - Consider versioning strategy
   - Ask: "Confirm breaking change approach?"

4. **Test Failures**
   - "Quality gates failing: [specifics]"
   - Option A: Fix issues before PR
   - Option B: Create draft PR
   - Option C: Document known issues
   - Ask: "How to proceed with failures?"

5. **Documentation Gaps**
   - "Missing documentation for:"
   - - New public APIs
   - - Configuration changes
   - - Migration instructions
   - Ask: "Should I add documentation first?"

## Advanced PR Patterns

### PR Stacks
For very large changes, create dependent PRs:
```bash
# Base PR
git checkout -b feature/base
# ... make changes
gh pr create --base main

# Dependent PR
git checkout -b feature/dependent
# ... make changes
gh pr create --base feature/base
```

### Draft PRs
For early feedback:
```bash
gh pr create --draft --title "WIP: $TITLE"
```

### PR Templates
Leverage repository PR templates:
```bash
# Use specific template
gh pr create --template .github/pull_request_template.md
```

## Quality Checklist

Before finalizing PR:

- [ ] Semantic commit message format
- [ ] Comprehensive PR description
- [ ] All tests passing
- [ ] Documentation complete
- [ ] No security vulnerabilities
- [ ] Performance impact assessed
- [ ] Breaking changes documented
- [ ] Reviewers assigned
- [ ] Linear ticket linked
- [ ] CI/CD pipeline green
