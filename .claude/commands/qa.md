# Execute Quality Assurance Test Suite

## Purpose
Run the complete QA test suite to ensure code quality and prevent regressions. ALL tests must pass before proceeding with any work.

## Pre-execution Setup

1. **Check Test Environment**
   ```bash
   # Ensure dependencies are installed
   bun install
   
   # Verify test configuration exists
   test -f CLAUDE.md || echo "WARNING: CLAUDE.md not found"
   ```

2. **Identify Test Commands**
   - Look for CI/test commands in `package.json`
   - Check CLAUDE.md for specific QA instructions
   - Common commands: `bun run ci`, `bun test`, `bun run test:e2e`

## Execution Protocol

### Step 1: Run Full Test Suite
```bash
# Start with the CI command if available
bun run ci

# Or run individual test types
bun test                    # Unit tests
bun run test:integration    # Integration tests
bun run test:e2e           # End-to-end tests
```

### Step 2: Monitor Results
- **Green Path**: All tests pass → Proceed with confidence
- **Red Path**: ANY test fails → STOP and investigate

### Step 3: Failure Response Protocol
If any test fails:

1. **Immediate Actions**
   - STOP all other work
   - Capture full error output
   - Note which test(s) failed

2. **Investigation**
   ```bash
   # Re-run failed test in isolation
   bun test path/to/failed.test.ts
   
   # Run with verbose output
   bun test --verbose
   
   # Check for environment issues
   bun run lint
   bun run typecheck
   ```

3. **Root Cause Analysis**
   - Recent code changes that could cause failure
   - Missing dependencies or configuration
   - Environment-specific issues
   - Timing/async issues in tests

4. **Fix and Verify**
   - Apply minimal fix to resolve issue
   - Re-run specific failed test
   - Run full suite again to ensure no side effects

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Dependency errors | Run `bun install --force` |
| Type errors | Run `bun run typecheck` and fix |
| Lint errors | Run `bun run lint --fix` |
| Database issues | Check migrations: `bun run db:migrate` |
| Port conflicts | Kill processes on required ports |

## Success Criteria
✅ All unit tests pass
✅ All integration tests pass
✅ All E2E tests pass
✅ No type errors
✅ No lint errors
✅ Coverage thresholds met (if configured)

## Important Rules
- **NEVER** skip or comment out failing tests
- **NEVER** modify test expectations to make them pass
- **ALWAYS** fix the actual issue causing test failure
- **ALWAYS** run full suite after fixing individual tests

## Output Format
```
QA Suite Results:
- Unit Tests: ✅ 150/150 passed
- Integration Tests: ✅ 45/45 passed
- E2E Tests: ✅ 12/12 passed
- Type Check: ✅ No errors
- Lint: ✅ No errors
- Total Time: 2m 34s

Status: READY TO PROCEED
```
