# /test

Run tests with appropriate strategies.

## Test Commands

```bash
bun run test              # Unit tests (vitest)
bun run test:integration  # Full stack tests
bun run ci               # All quality checks
```

## Test Strategies

<example>
# Component test (default: happy-dom)
test("renders", () => {
  render(<Component />)
  expect(screen.getByText("text")).toBeInTheDocument()
})

# API test (needs node)

/\*\*

- @vitest-environment node _/ test("api", () => { /_ server code \*/ })
  </example>

## Coverage Focus

- Critical paths
- Edge cases
- Error handling
- Security boundaries

## Common Issues

- Wrong environment → add @vitest-environment node
- Using bun:test → use bun run test
- Flaky tests → avoid arbitrary timeouts
