# DApp

## Stack

React 19 | TanStack (Start/Query/Form/Router) | oRPC | Drizzle | Better Auth |
Tailwind v4 | Vite

## Commands

```bash
bun run dev          # Port 3000
bun run codegen      # MANDATORY after API changes
bun run test         # vitest only (NOT bun:test)
bun run db:migrate   # After schema changes
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

```typescript
// React Testing Library + vitest
render(<Component />);
await user.click(button);
expect(result).toBeInTheDocument();
```

## Common Errors

- Copying server state
- Using bun:test
- Modifying ui/\* files
- Missing error boundaries
- No loading states
