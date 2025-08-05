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

- NO `components/ui/*` edits (these are shadcn components)
- Compound patterns with sub-components
- Loading states required
- Follow shadcn component patterns (see Component Best Practices)

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

#### Test Environment Configuration

**Default environment: `happy-dom`** (configured in vitest.config.ts)

```typescript
// Component tests (UI) - Uses default happy-dom, no directive needed
import { render, screen } from "@testing-library/react";

// Server-side tests (API/utilities) - Requires node environment
/**
 * @vitest-environment node
 */
import { describe, it, expect } from "vitest";
```

**Environment Guidelines:**

- **NO directive needed** for React component tests (uses default happy-dom)
- **Use `@vitest-environment node`** ONLY for:
  - API route tests (orpc routes)
  - Server-side utilities
  - Node.js specific code
  - Tests that fail with "This function can only be used on the server"
- **NEVER use `@vitest-environment jsdom`** (we use happy-dom instead)
- **NEVER use `@vitest-environment happy-dom`** (it's the default)

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

## Component Best Practices

### shadcn Component Pattern

All custom components should follow the modern shadcn pattern for consistency:

```typescript
// 1. NO forwardRef - use simple function components (shadcn removed forwardRef)
function Component({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof componentVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="component-name"
      className={cn(componentVariants({ variant }), className)}
      {...props}
    />
  );
}

// 2. Use cva for variants
const componentVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", secondary: "..." },
    size: { sm: "...", md: "...", lg: "..." },
  },
  defaultVariants: { variant: "default", size: "md" },
});

// 3. TypeScript: Use React.ComponentProps directly
type ComponentProps = React.ComponentProps<"div"> &
  VariantProps<typeof componentVariants> & {
    asChild?: boolean;
  };

// 4. Support composition with Radix Slot
const Comp = asChild ? Slot : "div";

// 5. Use data-slot attributes for styling hooks
<div data-slot="component-name" />;
```

### Animation Guidelines

**Use animations sparingly and purposefully:**

1. **Interactive Feedback** - Use `press-effect` class on buttons/clickable
   elements
2. **Hover States** - Use `hover-lift` class for cards that are interactive
3. **Entry Animations** - Use `animate-in-grid` for staggered grid items
4. **Duration** - Keep animations between 150-300ms
5. **CSS-first** - Use CSS transitions/animations over JavaScript

```css
/* Available utility classes in app.css */
.press-effect     /* Scale down on click (0.98) */
.hover-lift       /* Subtle lift on hover (-2px) */
.animate-in-grid  /* Staggered fade-in for grid items */
```

### Performance Guidelines

**Avoid premature optimization:**

1. **NO unnecessary useCallback/useMemo** - Only use for:
   - Referential stability in dependencies
   - Expensive computations (proven by profiling)
   - Props to React.memo components
2. **React 19 Compiler** handles most optimizations automatically

3. **Profile first** - Don't optimize without measuring

### Compound Component Pattern

Build flexible, composable components:

```typescript
// Parent container
<RelatedGrid>
  <RelatedGridHeader>
    <RelatedGridTitle>Title</RelatedGridTitle>
    <RelatedGridDescription>Description</RelatedGridDescription>
  </RelatedGridHeader>
  <RelatedGridContent columns={3} animate>
    <RelatedGridItem variant="gradient">
      <RelatedGridItemContent>...</RelatedGridItemContent>
      <RelatedGridItemFooter>...</RelatedGridItemFooter>
    </RelatedGridItem>
  </RelatedGridContent>
</RelatedGrid>
```

This pattern provides:

- Maximum flexibility
- Clear component hierarchy
- Easy customization per use case
- Consistent API across components

### Component Testing Guidelines

**Write comprehensive tests for all custom components:**

```typescript
// 1. Mock external dependencies (NOT component internals)
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// 2. Test component structure and variations
describe("Component", () => {
  describe("Structure and Layout", () => {
    it("should render with default props", () => {
      render(<Component />);
      expect(screen.getByTestId("component")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(<Component className="custom" />);
      expect(screen.getByTestId("component")).toHaveClass("custom");
    });
  });

  describe("Variants", () => {
    it.each(["default", "secondary", "ghost"] as const)(
      "should render %s variant",
      (variant) => {
        render(<Component variant={variant} />);
        // Test variant-specific classes
      }
    );
  });

  describe("Compound Composition", () => {
    it("should render with all sub-components", () => {
      render(
        <Component>
          <ComponentHeader>Header</ComponentHeader>
          <ComponentContent>Content</ComponentContent>
        </Component>
      );
      expect(screen.getByText("Header")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(<Component aria-label="Test component" />);
      expect(screen.getByLabelText("Test component")).toBeInTheDocument();
    });
  });
});

// 3. Test data-slot attributes for component identification
const element = container.querySelector('[data-slot="component-name"]');
expect(element).toBeInTheDocument();

// 4. Test animation classes when applicable
expect(element).toHaveClass("press-effect", "hover-lift");

// 5. DO NOT test:
// - Translation content (just verify keys are used)
// - External library behavior (e.g., Radix UI internals)
// - CSS styling details (use visual regression tests instead)
```

**Testing Best Practices:**

1. **Focus on behavior, not implementation**
2. **Test all variants and props combinations**
3. **Verify compound component composition**
4. **Check accessibility attributes**
5. **Mock at the boundary (external deps only)**
6. **Use data-testid sparingly (prefer accessible queries)**
7. **Group tests logically with describe blocks**
