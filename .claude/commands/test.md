# /test

Executes complete test suite including unit, integration, and subgraph tests.
Auto-fixes all errors/warnings for 100% pass rate.

## Step 1: Analyze Scope

Select testing strategy based on changes:

- 🎯 **Quick**: Minor changes → CI only
- ⚡ **Standard**: Features/APIs → CI + relevant integration tests
- 🚨 **Comprehensive**: Major releases → Full suite including subgraph tests

## Step 2: Execute Core Tests

Run base CI suite for unit tests, linting, type checking:

```bash
echo "🚀 Running CI..."
bun run ci
```

## Step 3: Execute Subgraph Integration Tests (if needed)

For changes affecting contracts, subgraph, or blockchain logic:

```bash
# 1. Start environment
echo "🐳 Starting Docker environment..."
bun run dev:up

# 2. Deploy contracts
echo "📦 Deploying contracts..."
bun run artifacts

# 3. Deploy subgraph
echo "📈 Deploying subgraph..."
bun run --cwd kit/subgraph publish

# 4. Generate test data
echo "🧪 Generating test data..."
bun run --cwd kit/contracts publish

# 5. Wait for sync
echo "⏳ Waiting for subgraph sync..."
sleep 30

# 6. Run integration tests
echo "🔍 Running subgraph tests..."
bun run --cwd kit/subgraph test:integration
```

## Step 4: Auto-Resolution

Fix all issues until tests pass:

- Test failures: Update assertions or fix code
- Type errors: Resolve all type issues
- Lint warnings: Apply fixes
- Import errors: Correct paths
- Coverage gaps: Add missing tests

## Minimal Output

Report only:

- Pass/Fail status per test suite
- Fixed issues count
- Final score (A-F)

## Quick Commands

```bash
# Unit tests only
bun test

# Specific package tests
bun run --cwd kit/dapp test
bun run --cwd kit/contracts test
bun run --cwd kit/subgraph test

# Individual subgraph test files (after setup)
cd kit/subgraph && bun test test/actions.spec.ts
```

## Gate Enforcement

All must pass:

- [ ] 100% unit tests
- [ ] 0 type errors
- [ ] 0 lint warnings
- [ ] Integration tests (if applicable)
- [ ] Subgraph tests (if applicable)
- [ ] Performance benchmarks
- [ ] Security checks

Continue fixing until all gates pass.

# Self-Learning & Test Patterns

## Automatic Test Intelligence

Silently capture and apply test learnings:

1. **Common Failures**: Recurring test issues and fixes
2. **Flaky Tests**: Patterns that cause intermittent failures
3. **Setup Issues**: Environment-specific test problems
4. **Performance**: Slow tests and optimization techniques
5. **Coverage Gaps**: Areas frequently missing tests

## Learning Integration

- Store learnings in this file under "Learned Test Patterns"
- Update CLAUDE.md for project-wide test conventions
- Apply fixes automatically based on past learnings
- Build knowledge of test suite peculiarities

## Learned Test Patterns

<!-- AI appends patterns here -->
<!-- Format: ### Pattern Name
     Test Type: Unit/Integration/E2E
     Failure Mode: What typically breaks
     Root Cause: Why it happens
     Auto-Fix: How to resolve automatically
     Prevention: Long-term solution -->
