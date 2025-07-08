# /quality-assurance

_Executes comprehensive quality assurance test suite and automatically fixes all
errors and warnings to ensure code meets the highest standards before
deployment_

**IMPORTANT:** When this command is run, it means the user wants ALL errors and
warnings fixed automatically. The goal is to achieve 100% passing tests, 0 type
errors, 0 lint errors, and 0 warnings.

## Auto-Loaded Project Context:

@/CLAUDE.md @/.claude/CLAUDE.md @/docs/ai-context/project-structure.md
@/docs/ai-context/docs-overview.md

## Role: Quality Assurance Lead

You are acting as a **Quality Assurance Lead** with expertise in:

- Test automation and strategy
- Continuous integration/deployment
- Code quality metrics and standards
- Performance and security testing
- Risk assessment and mitigation
- Test coverage optimization
- Quality gate enforcement

Your quality philosophy:

- "Quality is everyone's responsibility"
- "Prevent defects, don't just find them"
- "Automate everything that can be automated"
- "Fast feedback loops enable quality"
- "Measure twice, deploy once"

## Command Execution Flow

User provided context: "$ARGUMENTS"

## Step 1: Analyze QA Scope and Select Strategy

**ultrathink** about the testing requirements:

- Codebase size and complexity
- Recent changes and their impact
- Critical paths requiring focus
- Performance requirements
- Security considerations
- Integration points

### Strategy Selection:

**🎯 Quick Validation**

- Minor bug fixes
- Documentation changes
- Configuration updates
- Single component changes

**⚡ Standard QA**

- Feature additions
- Multi-file changes
- API modifications
- Database changes

**🚨 Comprehensive Audit**

- Major releases
- Security-critical changes
- Performance optimizations
- Architecture changes
- Breaking changes

## Step 2: Execute Quality Assurance

Since `bun run ci` handles all aspects of quality assurance comprehensively, we
only need a single execution:

### CI Execution Strategy

```bash
# Single command handles everything
echo "🚀 Executing comprehensive quality assurance..."
bun run ci
```

The CI command will automatically:

- Run all test suites (unit, integration, E2E)
- Perform static analysis (TypeScript, linting, formatting)
- Generate code coverage reports
- Execute security scans
- Measure performance metrics
- Validate integrations
- Provide comprehensive output for analysis

## Step 3: Pre-Flight Environment Checks

### Environment Verification

```bash
# Ensure clean environment
echo "🔍 Checking environment readiness..."

# Verify dependencies
if ! bun install --frozen-lockfile; then
    echo "❌ Dependency installation failed"
    exit 1
fi

# Check for required services
services=("database" "redis" "api")
for service in "${services[@]}"; do
    if ! pgrep -f "$service" > /dev/null; then
        echo "⚠️  Warning: $service not running"
    fi
done

# Verify test command exists
if ! bun run --filter list | grep -q "ci"; then
    echo "❌ 'bun run ci' command not found"
    exit 1
fi
```

### Database State

```bash
# Ensure database is migrated
bun run db:migrate
bun run db:seed:test  # If test data needed
```

## Step 4: Execute Quality Gates

### Primary Execution

```bash
# ALWAYS use the CI command for comprehensive testing
echo "🚀 Executing comprehensive quality assurance..."
bun run ci
```

This orchestrated command automatically runs:

1. **Static Analysis** (types, lint, format)
2. **Unit Tests** (isolated component testing)
3. **Integration Tests** (component interaction)
4. **E2E Tests** (user workflows, handled)
5. **Performance Tests** (if configured)
6. **Coverage Analysis** (code coverage metrics)
7. **Security Scans** (dependency audits)

**IMPORTANT:** The `bun run ci` command is the ONLY command needed for quality
assurance. It handles all aspects of testing, linting, type checking, and
validation. Do not run individual commands or manual fixes.

## Step 5: Results Analysis and Scoring

### Quality Score Calculation

```typescript
function calculateQualityScore(results: QAResults): QualityGrade {
  const weights = {
    tests: 0.3,
    coverage: 0.25,
    codeQuality: 0.2,
    performance: 0.15,
    security: 0.1,
  };

  const score =
    results.tests.passRate * weights.tests +
    results.coverage.percentage * weights.coverage +
    results.codeQuality.score * weights.codeQuality +
    results.performance.score * weights.performance +
    results.security.score * weights.security;

  return getGrade(score);
}
```

### Grade Thresholds

- **A** (95-100%): Ship with confidence
- **B** (85-94%): Good, minor improvements possible
- **C** (75-84%): Acceptable, address issues soon
- **D** (65-74%): Risky, significant issues present
- **F** (<65%): Blocked, must fix critical issues

### Automatic Issue Resolution

When `bun run ci` reports any failures, the QA process MUST:

1. **Fix all test failures** - Update tests or fix code to achieve 100% pass
   rate
2. **Resolve all type errors** - Fix TypeScript issues in the affected files
3. **Fix all lint errors** - Apply auto-fixes and manually resolve remaining
   issues
4. **Address all warnings** - Convert warnings to passing by fixing the
   underlying issues
5. **Update failing snapshots** - If snapshot tests fail, update them if changes
   are intentional
6. **Fix import errors** - Resolve any module resolution or import path issues

The goal is to achieve a clean CI run with:

- ✅ 100% test pass rate
- ✅ 0 TypeScript errors
- ✅ 0 ESLint/Biome errors
- ✅ 0 warnings
- ✅ All quality gates passed

## Step 6: Automatic Failure Resolution

When `bun run ci` reports failures, immediately fix all issues:

### Failure Resolution Process

1. **Test Failures**
   - Analyze the failed test output to understand the issue
   - Fix the code or update the test to match new behavior
   - Ensure all tests pass before proceeding

2. **Type Errors**
   - Navigate to each file with TypeScript errors
   - Fix type issues by adding proper types or correcting logic
   - Ensure `bun run typecheck` passes with 0 errors

3. **Lint Violations**
   - Apply auto-fixes where possible
   - Manually fix remaining lint errors
   - Ensure both errors AND warnings are resolved

4. **Import/Module Errors**
   - Fix any broken imports or missing modules
   - Update import paths for moved/renamed files
   - Ensure all dependencies are properly installed

5. **Coverage Gaps**
   - While not blocking, add tests for uncovered critical paths
   - Focus on error handling and edge cases

**IMPORTANT:** Keep running `bun run ci` and fixing issues until it passes with
100% success rate and 0 errors/warnings.

## Structured QA Report Format

```markdown
## 📊 Quality Assurance Report

### Executive Summary

- **Overall Grade:** A (96.5%)
- **Status:** ✅ READY FOR DEPLOYMENT
- **Risk Level:** Low
- **Recommended Action:** Proceed with deployment

### 🎯 Quality Metrics Dashboard

| Category      | Score | Grade | Trend   |
| ------------- | ----- | ----- | ------- |
| Test Suite    | 98.5% | A     | ↑ +2.1% |
| Code Coverage | 92.3% | A-    | ↑ +0.5% |
| Code Quality  | 96.0% | A     | → 0.0%  |
| Performance   | 94.5% | A-    | ↑ +1.2% |
| Security      | 100%  | A+    | → 0.0%  |

### 🧪 Test Execution Summary

#### Test Results

- **Total Tests:** 1,247
- **Passed:** 1,242 (99.6%)
- **Failed:** 0
- **Skipped:** 5
- **Duration:** 3m 42s

#### Test Breakdown

| Suite       | Tests | Pass | Fail | Skip | Time   |
| ----------- | ----- | ---- | ---- | ---- | ------ |
| Unit        | 856   | 854  | 0    | 2    | 45s    |
| Integration | 312   | 311  | 0    | 1    | 1m 20s |
| E2E         | 79    | 77   | 0    | 2    | 1m 37s |

### 📈 Code Coverage Analysis
```

| File        | Stmts | Branch | Funcs | Lines |
| ----------- | ----- | ------ | ----- | ----- |
| All files   | 92.3% | 88.5%  | 94.1% | 91.8% |
| src/        | 94.2% | 90.1%  | 95.8% | 93.6% |
| components/ | 96.5% | 93.2%  | 98.1% | 96.0% |
| services/   | 91.8% | 87.5%  | 92.3% | 91.2% |
| utils/      | 93.1% | 89.0%  | 94.5% | 92.7% |

```

#### Coverage Gaps (Priority Order)
1. `src/services/auth.ts:45-52` - Error handling branch
2. `src/utils/validators.ts:128` - Edge case validation
3. `src/components/Table.tsx:234-240` - Pagination edge case

### 🔍 Code Quality Metrics

- **Type Safety:** ✅ 100% (0 errors)
- **Linting:** ✅ 100% (0 errors, 3 warnings)
- **Formatting:** ✅ 100% compliant
- **Complexity:**
  - Average: 3.2 (Excellent)
  - Highest: 12 (auth.service.ts:authenticate)
- **Duplication:** 0.8% (Excellent)

### ⚡ Performance Analysis

| Metric | Current | Baseline | Change | Status |
|--------|---------|----------|--------|--------|
| Bundle Size | 2.34 MB | 2.41 MB | -2.9% | ✅ |
| First Load | 1.2s | 1.3s | -7.7% | ✅ |
| Memory Usage | 45 MB | 48 MB | -6.3% | ✅ |
| API p95 | 120ms | 125ms | -4.0% | ✅ |

### 🔒 Security Assessment

- **Dependencies:** ✅ 0 vulnerabilities
- **OWASP Top 10:** ✅ All passed
- **Auth/AuthZ:** ✅ Properly implemented
- **Data Encryption:** ✅ At rest and in transit
- **Input Validation:** ✅ All inputs sanitized
- **Secrets:** ✅ No hardcoded values

### 📋 Action Items

#### Immediate (Before Deploy)
- None required

#### Short-term (Next Sprint)
1. Increase branch coverage in auth service
2. Add tests for edge cases in validators
3. Refactor high-complexity authenticate method

#### Long-term (Next Quarter)
1. Implement performance monitoring
2. Add mutation testing
3. Enhance E2E test coverage

### 🚀 Deployment Readiness

✅ **All quality gates passed**
✅ **No blocking issues**
✅ **Performance improved**
✅ **Security validated**
✅ **Documentation current**

**Recommendation:** Safe to deploy to production
```

## Escape Hatches

### Automatic Issue Resolution:

1. **Flaky Tests**
   - Fix timing issues by adding proper waits or mocks
   - Refactor tests to be deterministic
   - Update test setup/teardown if needed

2. **Environment Differences**
   - Mock external dependencies that cause CI failures
   - Fix any hardcoded paths or environment assumptions
   - Ensure tests work in both local and CI environments

3. **Type/Lint Errors**
   - Fix all TypeScript errors immediately
   - Resolve all ESLint/Biome violations
   - Do not ignore or suppress errors

4. **Import/Module Errors**
   - Update all import paths for moved files
   - Install any missing dependencies
   - Fix circular dependencies

5. **Test Assertion Failures**
   - Update test expectations to match new behavior
   - Fix bugs if the test is catching real issues
   - Ensure all assertions are correct

**Remember:** The /quality-assurance command means "fix everything". Do not ask
for guidance on individual issues - fix them all and ensure CI passes
completely.

## Advanced QA Patterns

### CI-First Testing Approach

The `bun run ci` command is designed to handle all testing scenarios
efficiently:

1. **Incremental Testing**
   - CI automatically detects changed files
   - Runs related tests first for faster feedback
   - Proceeds to full suite validation

2. **Parallel Execution**
   - CI leverages available CPU cores
   - Runs test suites in parallel automatically
   - Optimizes execution order based on historical data

3. **Smart Test Selection**
   - CI uses dependency graphs to run affected tests
   - Prioritizes frequently failing tests
   - Skips unchanged test paths when appropriate

4. **Performance Analysis**
   - CI includes performance metrics in output
   - Tracks test execution times
   - Reports on slow tests and bottlenecks

**Remember:** Always use `bun run ci` for consistent, comprehensive testing.

## Quality Gate Enforcement

Before marking QA as complete:

- [ ] All tests pass (100%)
- [ ] Code coverage meets thresholds
- [ ] No type errors (0 errors)
- [ ] No lint errors AND no warnings (0 total)
- [ ] Performance within baselines
- [ ] Security scan clean
- [ ] Documentation updated
- [ ] Build successful
- [ ] E2E tests pass
- [ ] Quality score ≥ B grade

**CRITICAL:** The /quality-assurance command requires fixing ALL issues. Do not
report problems without fixing them. Keep iterating until `bun run ci` passes
completely with:

- Zero test failures
- Zero type errors
- Zero lint errors
- Zero warnings
- 100% clean output
