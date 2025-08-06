# DApp Module

## Stack

React 19 | TanStack (Start/Query/Form/Router) | oRPC | Drizzle | Better Auth |
Tailwind v4 | Vite

## Key Commands

```bash
bun run dev               # Port 3000
bun run codegen           # After API changes
bun run test              # Vitest (NOT bun:test)
bun run test:integration  # Full stack tests
bun run db:migrate        # After schema changes
```

## Architecture

<example>
# Directory Structure
src/
├── components/ui/    # shadcn (NEVER modify)
├── routes/          # File-based routing
├── orpc/            # API layer
├── lib/auth/        # Better Auth
└── hooks/           # Custom hooks
</example>

<example>
# Route Patterns
__root.tsx   # Providers
_private.tsx # Auth guard
$param.tsx   # Dynamic routes
</example>

## Critical Patterns

<example>
# Data Fetching (TanStack Query)
useQuery(orpc.token.list.queryOptions())
useMutation(orpc.token.create.mutationOptions())
# Never copy to local state
</example>

<example>
# Form Handling (TanStack Form + Zod)
useForm({
  validatorAdapter: zodValidator(),
  validators: { onChange: schema }
})
</example>

<example>
# Component Pattern (shadcn style - NO forwardRef)
function Component({ className, variant, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "div"
  return <Comp className={cn(variants({ variant }), className)} {...props} />
}
</example>

## Testing

<example>
# Default: happy-dom (components)
import { render, screen } from "@testing-library/react"
test("renders", () => { render(<Component />) })

# Node environment (API/server code)

/\*\*

- @vitest-environment node _/ test("api", () => { /_ server code \*/ })
  </example>

## Performance Rules

- React Compiler handles optimization (no manual memo)
- Route-based code splitting
- Suspense boundaries
- Server Components first

## Common Issues

- Using bun:test → use `bun run test`
- Modifying ui/\* → these are shadcn, don't touch
- Copying server state → use React Query
- Missing @vitest-environment node → for server code

## Refactoring

- Apply changes directly (no compatibility layers)
- Complete transformations (not partial)
- Clean, modern code only
