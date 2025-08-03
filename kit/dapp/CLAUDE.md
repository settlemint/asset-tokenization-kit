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

- React Compiler (no manual memo)
- Route-based splitting
- `select` for transforms
- Suspense boundaries

## Testing

### Unit Tests

```typescript
// React Testing Library + vitest
render(<Component />);
await user.click(button);
expect(result).toBeInTheDocument();
```

### Integration Tests

```bash
# Clean test environment with test:reset
bun run test:integration

# Uses separate config: vitest.config.integration.ts
# Runs in Node environment with full Docker stack
# Tests complete user flows and API interactions
```

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
