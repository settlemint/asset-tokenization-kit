# CLAUDE.md - E2E Package

## Purpose

End-to-end test suite for the Asset Tokenization Kit using Playwright. Validates
complete user workflows including authentication, onboarding, asset creation,
and management. Tests both UI interactions and API endpoints to ensure system
integrity across the full stack.

## Layout

```
e2e/
├── ui-tests/           # UI workflow tests
├── pages/              # Page object models
├── test-data/          # Test fixtures and data
├── utils/              # Test helpers and utilities
└── playwright.*.config.ts  # Test configurations
```

## Dependencies (names only)

- **Local packages**: None (tests other packages)
- **Key libraries**: Playwright, TypeScript

## Best Practices (Local)

<!-- BEGIN AUTO -->

- **Page Object Model**: Encapsulate page interactions in reusable classes; keep
  selectors in one place; implement wait strategies; provide meaningful method
  names
- **Test Organization**: Group related tests in describe blocks; use
  beforeEach/afterEach for setup/teardown; implement test isolation; avoid test
  interdependencies
- **Data Management**: Use fixtures for test data; implement data cleanup; avoid
  hardcoded values; generate unique identifiers for parallel execution
- **Assertions**: Use web-first assertions; implement custom matchers for
complex validations; verify both positive and negative cases; check
accessibility
<!-- END AUTO -->

## Style & Testing Cues

### TypeScript-only

- Strict typing for page objects and test data
- Type-safe selectors and assertions
- Async/await for all browser interactions

### Oxlint/Prettier deltas from root

- Playwright-specific Oxlint rules
- Test file naming convention: `*.spec.ts`

### Test locations

- UI tests: `ui-tests/*.spec.ts`
- Page objects: `pages/*.ts`

## Agent Hints (Local)

### Interface boundaries

- **Browser automation**: Tests run against real browser instances
- **Network isolation**: Tests should work with mocked backends
- **State management**: Each test should set up its own state

### Safe extension points

- Add new test files in `ui-tests/`
- Extend page objects in `pages/` for new UI elements
- Add test data fixtures in `test-data/`

### What not to touch

- Global setup/teardown configurations
- Authentication helpers - security sensitive
- Database cleanup utilities - data integrity

### CI considerations

- Tests run in headless mode in CI
- Parallel execution configured for speed
- Screenshots/videos captured on failure
- Network requests can be intercepted and mocked
