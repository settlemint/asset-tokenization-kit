# DApp

## Stack

React 19 | TanStack (Start/Query/Form/Router) | oRPC | Drizzle | Better Auth |
Tailwind v4 | Vite

## Commands

```bash
bun run dev               # Port 3000
bun run codegen           # MANDATORY after API changes
bun run test              # Unit tests - vitest only (NOT bun:test)
bun run test:integration  # Integration tests - full stack testing
bun run db:migrate        # After schema changes
```

## Architecture

### Directory Structure

```
src/
├── components/ui/    # shadcn (NEVER MODIFY)
├── routes/          # File-based routing
├── orpc/            # API layer (see orpc/CLAUDE.md)
├── lib/auth/        # Better Auth
└── hooks/           # Custom hooks
```

### Route Patterns

- `__root.tsx` - Providers
- `_private.tsx` - Auth guard
- `$param.tsx` - Dynamic routes

### Component Rules

- NO `components/ui/*` edits
- Compound patterns
- Loading states required

## Patterns

### Data Fetching

```typescript
// ✅ CORRECT
useQuery(orpc.token.list.queryOptions());
useMutation(orpc.token.create.mutationOptions());

// ❌ WRONG
const [data, setData] = useState(queryData);
```

### Form Handling

```typescript
// TanStack Form + Zod
useForm({
  validatorAdapter: zodValidator(),
  validators: { onChange: schema },
});
```

### State Management

- URL state for filters
- React Query for server state
- No Redux/Zustand

### Multi-step Wizards

```typescript
<MultistepWizard>
  <WizardStep name="details" />
  <WizardStep name="compliance" />
</MultistepWizard>
```

### Data Tables

URL-synced pagination/sorting/filtering

## Performance

### React 19 Optimization

- React Compiler (no manual memo)
- Route-based splitting
- `select` for transforms
- Suspense boundaries
- Server Components first
- useTransition for non-urgent updates
- useOptimistic for instant UI

### Memoization Guidelines

**USE memo/useCallback/useMemo WHEN:**

- Passing to React.memo components
- Expensive computations (proven by profiling)
- Referential stability for effects
- Dependencies in other hooks

**AVOID WHEN:**

- Passing to DOM elements
- Dependencies change every render
- No measurable performance impact

### TanStack Best Practices

```typescript
// Parallel queries
useQueries({ queries: [users, posts, comments] });

// Optimistic updates
useMutation({
  onMutate: async (newData) => {
    await queryClient.cancelQueries(['items']);
    const previous = queryClient.getQueryData(['items']);
    queryClient.setQueryData(['items'], old => [...old, newData]);
    return { previous };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['items'], context.previous);
  }
});

// Infinite + Virtual scroll
const query = useInfiniteQuery({ ... });
const virtualizer = useVirtualizer({ ... });
```

## Testing

### Unit Tests (Vitest)

```typescript
// React Testing Library + vitest
render(<Component />);
await user.click(button);
expect(result).toBeInTheDocument();

// ALWAYS use concurrent tests
test.concurrent("test 1", async () => {});
test.concurrent("test 2", async () => {});

// Mocking patterns
vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
}));

// Test structure (AAA pattern)
describe("Component", () => {
  beforeEach(() => {
    // Arrange
  });

  it("should handle user interaction", async () => {
    // Act
    await user.click(button);
    // Assert
    expect(result).toBeInTheDocument();
  });
});
```

### Integration Tests

```bash
# Clean test environment with test:reset
bun run test:integration

# Uses separate config: vitest.config.integration.ts
# Runs in Node environment with full Docker stack
# Tests complete user flows and API interactions
```

### Test Best Practices

- **TDD**: Write failing tests first
- **Coverage**: Focus on critical paths, not percentage
- **Mocking**: Mock external dependencies, not internals
- **Async**: Always await async operations
- **Cleanup**: Use afterEach for cleanup
- **Deterministic**: No random data, use fixtures

## Common Errors

- Copying server state
- Using bun:test
- Modifying ui/\* files
- Missing error boundaries
- No loading states

## Refactoring Rules

- NO compatibility layers or helper functions during refactors
- Apply changes directly throughout the entire codebase
- Write clean, modern code without temporary bridges
- Complete transformations, not partial migrations
