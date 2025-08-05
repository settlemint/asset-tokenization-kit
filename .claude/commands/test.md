# /test

Executes complete test suite via test-validator agent.

## Agent Invocation

**MANDATORY**: Always use test-validator agent for ALL test runs:

```javascript
// Trigger test-validator agent
Task({
  description: "Run full test suite",
  prompt: `Execute the complete test suite including:
    1. bun run ci (all standard checks)
    2. bun run test:integration (integration tests)
    
    Report any failures with details.`,
  subagent_type: "test-validator",
});
```

## Execution

The test-validator agent handles:

- Unit tests
- Type checking
- Linting
- Coverage validation
- Integration tests
- Parallel execution for speed

**IMPORTANT**: The agent runs BOTH `bun run ci` AND `bun run test:integration`

## Complete Validation Process

1. Agent runs CI suite: `bun run ci`
2. Agent runs integration tests: `bun run test:integration`
3. Both must pass before PR

## Result

Reports pass/fail status with detailed output. All checks must pass.

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
