# /test

Execute comprehensive test suite to ensure 100% code quality.

## Execution

Invoke the test-runner agent using:

```javascript
Task({
  description: "Run tests",
  subagent_type: "test-runner",
  prompt: `Execute appropriate test suite based on recent changes:
    - Analyze what changed to determine test scope
    - Run relevant tests (unit, integration, e2e, contracts)
    - Auto-fix any lint, format, or type errors
    - Wait for Forge compilation if testing contracts (use extended timeout)
    - Ensure all quality gates pass
    - Apply learned optimizations from previous test runs
    - Generate detailed report with coverage metrics`
})
```

## What the Agent Does

1. **Smart Test Selection**: Analyzes changes to run only relevant tests
2. **Auto-Fix**: Automatically resolves common issues (lint, formatting, types)
3. **Parallel Execution**: Optimizes test order and parallelization
4. **Learning Application**: Uses patterns from previous runs to optimize
5. **Comprehensive Report**: Provides metrics, coverage, and recommendations

## Self-Learning

The agent learns from test patterns:
- Identifies and tracks flaky tests
- Optimizes execution order based on historical data
- Learns common fixes for test failures
- Documents environment-specific requirements
