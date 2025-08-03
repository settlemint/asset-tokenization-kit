# /test

Executes complete test suite including unit, integration, and subgraph tests.
Auto-fixes all errors/warnings for 100% pass rate.

## Agent Usage

**Primary agent**: test-validator (handles all test execution) **Support
agents**:

- researcher: For finding test patterns and best practices
- code-reviewer: For reviewing test coverage and quality

## Step 1: Analyze Scope

Select testing strategy based on changes:

- 🎯 **Quick**: Minor changes → CI only
- ⚡ **Standard**: Features/APIs → CI + relevant integration tests
- 🚨 **Comprehensive**: Major releases → Full suite including subgraph tests

### Documentation Check

Before running tests, verify documentation:

```bash
# Check for README.md in changed modules
find . -name "README.md" -newer .git/FETCH_HEAD

# Verify CLAUDE.md mentions test patterns
grep -i "test" CLAUDE.md
```

### Gemini-CLI Test Enhancement

Use gemini-cli to analyze code changes and generate test strategies:

```javascript
mcp__gemini -
  cli__ask -
  gemini({
    prompt: "@recent-changes analyze and suggest test coverage strategy",
    changeMode: true,
    model: "gemini-2.5-pro",
  });
```

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

### Gemini-CLI Test Generation

Generate missing tests and fix failing ones:

1. **Generate Missing Tests**:

   ```javascript
   mcp__gemini -
     cli__ask -
     gemini({
       prompt:
         "@uncovered-code generate comprehensive test cases with edge cases",
       changeMode: true,
       model: "gemini-2.5-pro",
     });
   ```

2. **Fix Failing Tests**:

   ```javascript
   mcp__gemini -
     cli__ask -
     gemini({
       prompt: "@failing-test.spec.ts analyze failure and suggest fix",
       changeMode: true,
       sandbox: true,
     });
   ```

3. **Generate Edge Cases**:
   ```javascript
   mcp__gemini -
     cli__brainstorm({
       prompt: "Generate edge case tests for authentication flow",
       domain: "software",
       constraints: "Focus on security, race conditions, and error handling",
       ideaCount: 15,
       includeAnalysis: true,
     });
   ```

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

## Gemini-CLI Test Intelligence

Leverage gemini-cli for advanced test capabilities:

### 1. **Test Coverage Analysis**

```javascript
mcp__gemini -
  cli__ask -
  gemini({
    prompt: "@coverage-report.json identify critical untested paths",
    changeMode: false,
    model: "gemini-2.5-pro",
  });
```

### 2. **Performance Test Generation**

```javascript
mcp__gemini -
  cli__brainstorm({
    prompt: "Generate performance test scenarios for API endpoints",
    domain: "software",
    constraints: "Focus on load testing, concurrent requests, and memory usage",
    ideaCount: 10,
  });
```

### 3. **Test Refactoring**

```javascript
mcp__gemini -
  cli__ask -
  gemini({
    prompt:
      "@test-suite/* suggest refactoring to reduce duplication and improve maintainability",
    changeMode: true,
  });
```

### 4. **Flaky Test Detection**

```javascript
mcp__gemini -
  cli__ask -
  gemini({
    prompt:
      "@test-history.log identify flaky tests and suggest stabilization strategies",
    changeMode: true,
  });
```

### 5. **Mock Generation**

```javascript
mcp__gemini -
  cli__ask -
  gemini({
    prompt: "@interface.ts generate comprehensive mocks for testing",
    changeMode: true,
    model: "gemini-2.5-pro",
  });
```

## Sentry Test Monitoring

Track test failures and flaky tests in production:

1. **Monitor Test Failures**:

   ```javascript
   mcp__sentry__search_issues({
     organizationSlug: "your-org",
     naturalLanguageQuery: "test suite failed CI",
     limit: 20,
   });
   ```

2. **Analyze Flaky Tests**:

   ```javascript
   mcp__sentry__search_events({
     organizationSlug: "your-org",
     naturalLanguageQuery: "intermittent test failure",
     limit: 15,
   });
   ```

3. **Track Test Performance**:
   ```javascript
   mcp__sentry__analyze_issue_with_seer({
     organizationSlug: "your-org",
     issueId: "TEST-TIMEOUT-123",
     instruction: "Analyze why this test is timing out",
   });
   ```

## Playwright E2E Testing

Automate browser testing for critical user flows:

1. **Navigate and Test**:

   ```javascript
   // Navigate to app
   mcp__playwright__browser_navigate({
     url: "http://localhost:5173",
   });

   // Take snapshot for analysis
   mcp__playwright__browser_snapshot();
   ```

2. **Form Testing**:

   ```javascript
   // Fill form fields
   mcp__playwright__browser_type({
     element: "Email input field",
     ref: "input[name='email']",
     text: "test@example.com",
   });

   // Submit form
   mcp__playwright__browser_click({
     element: "Submit button",
     ref: "button[type='submit']",
   });
   ```

3. **Assertion Testing**:

   ```javascript
   // Wait for success message
   mcp__playwright__browser_wait_for({
     text: "Successfully submitted",
   });

   // Verify navigation
   mcp__playwright__browser_evaluate({
     function: "() => window.location.pathname",
   });
   ```

4. **Visual Regression**:

   ```javascript
   // Take screenshot for comparison
   mcp__playwright__browser_take_screenshot({
     filename: "homepage-test.png",
     fullPage: true,
   });
   ```

5. **Error Monitoring**:

   ```javascript
   // Check console errors
   mcp__playwright__browser_console_messages();

   // Monitor network failures
   mcp__playwright__browser_network_requests();
   ```

## Learned Test Patterns

<!-- AI appends patterns here -->
<!-- Format: ### Pattern Name
     Test Type: Unit/Integration/E2E
     Failure Mode: What typically breaks
     Root Cause: Why it happens
     Auto-Fix: How to resolve automatically
     Prevention: Long-term solution -->
