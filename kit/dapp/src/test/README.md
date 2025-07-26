# Testing TanStack Router File-Based Routes

This directory contains test utilities and examples for testing TanStack Router
file-based routes.

## Test Structure

```
src/test/
├── utils/
│   ├── router-test-utils.ts    # Router testing utilities
│   └── test-query-client.ts    # Query client for tests
├── mocks/
│   └── orpc-mocks.ts          # Mock ORPC client and users
└── README.md
```

## Running Tests

```bash
# Run all unit tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run specific test file
bun run test src/routes/_private/onboarding/onboarding.test.tsx

# Run with coverage
bun run test:coverage
```

## Writing Route Tests

### Basic Route Test

```typescript
import { createTestRouter } from "@/test/utils/router-test-utils";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("My Route", () => {
  it("should render correctly", async () => {
    const { router, queryClient } = createTestRouter({
      initialLocation: "/my-route",
    });

    render(<TestRouterProvider router={router} queryClient={queryClient} />);

    await router.load();

    await waitFor(() => {
      expect(screen.getByText("Expected Content")).toBeInTheDocument();
    });
  });
});
```

### Testing with ORPC Mocks

```typescript
import { createMockOrpcClient, createMockUser } from "@/test/mocks/orpc-mocks";
import { vi } from "vitest";

// Mock the ORPC client
const mockOrpc = createMockOrpcClient();
vi.mock("@/orpc/orpc-client", () => ({
  orpc: mockOrpc,
}));

// In your test
const mockUser = createMockUser({
  email: "test@example.com",
  role: "admin",
});

mockOrpc.user.me.queryOptions.mockReturnValue({
  queryKey: ["user", "me"],
  queryFn: () => Promise.resolve(mockUser),
});
```

### Testing Navigation

```typescript
import { navigateTo } from "@/test/utils/router-test-utils";

// Navigate to a route
await navigateTo(router, "/new-route");

// Check the current location
expect(router.state.location.pathname).toBe("/new-route");
```

### Testing Route Guards

```typescript
it("should redirect unauthorized users", async () => {
  const mockUser = createMockUser({ role: "user" });

  const { router, queryClient } = createTestRouter({
    initialLocation: "/admin-only-route",
    context: { orpc: mockOrpc },
  });

  queryClient.setQueryData(["user", "me"], mockUser);
  await router.load();

  // Should redirect to unauthorized page
  expect(router.state.location.pathname).toBe("/unauthorized");
});
```

## Best Practices

1. **Mock External Dependencies**: Always mock ORPC client and other external
   services
2. **Use Query Client**: Pre-populate the query cache with test data to avoid
   async issues
3. **Wait for Navigation**: Use `waitFor` when asserting on navigation changes
4. **Test Error States**: Include tests for loading, error, and edge cases
5. **Clean Up**: Use `beforeEach` to reset mocks between tests

## Common Patterns

### Testing Form Submissions

```typescript
import userEvent from "@testing-library/user-event";

const user = userEvent.setup();

// Fill form
await user.type(screen.getByLabelText("Name"), "Test User");
await user.click(screen.getByRole("button", { name: "Submit" }));

// Verify submission
await waitFor(() => {
  expect(mockOrpc.someEndpoint.$mutate).toHaveBeenCalledWith({
    name: "Test User",
  });
});
```

### Testing Loading States

```typescript
// Delay the mock response
mockOrpc.user.me.queryOptions.mockReturnValue({
  queryKey: ["user", "me"],
  queryFn: () =>
    new Promise((resolve) => setTimeout(() => resolve(mockUser), 100)),
});

// Check loading state
expect(screen.getByText(/loading/i)).toBeInTheDocument();

// Wait for content
await waitFor(() => {
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

### Testing Route Parameters

```typescript
const { router } = createTestRouter({
  initialLocation: "/items/123",
});

// Access route params
const params = router.state.location.params;
expect(params.id).toBe("123");
```

## Debugging Tips

1. Use `screen.debug()` to see the current DOM
2. Check `router.state` for current route information
3. Use `vi.spyOn` to monitor function calls
4. Enable query client logging for debugging:

```typescript
const queryClient = createTestQueryClient();
queryClient.getLogger().log = console.log;
```
