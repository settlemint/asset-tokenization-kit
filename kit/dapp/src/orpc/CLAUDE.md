# oRPC Architecture

## Context

Type-safe RPC layer. Contract-first development. Zod validation. Middleware
composition.

## Structure

```
procedures/
├── base.router.ts      # Context<T> foundation
├── public.router.ts    # No auth required
├── auth.router.ts      # Authenticated users
└── onboarded.router.ts # Post-onboarding

middlewares/
├── auth.middleware.ts  # Session validation
├── role.middleware.ts  # RBAC checks
└── portal.middleware.ts # Service integration

helpers/
├── transaction-receipt.ts # Blockchain tx handling
├── challenge-response.ts  # 2FA/pincode
└── mutation-messages.ts   # User feedback

context/
└── context.ts # ctx.{user,db,portal,blockchain}
```

## Patterns

### Procedure Types

```typescript
publicProcedure; // No auth
baseProcedure; // Auth required
onboardedProcedure; // KYC complete
contractProcedure; // Blockchain ops
```

### Middleware Stack

1. Error handling
2. Authentication
3. Role validation
4. Portal services
5. Blockchain clients

### Context Access

- `ctx.user` - Authenticated user
- `ctx.db` - Drizzle ORM
- `ctx.portal` - SettleMint API
- `ctx.blockchain` - Web3 clients

### Validation

```typescript
.input(z.object({...}))  // Zod schemas
.output(schema)          // Type-safe responses
```

### Error Handling

- ORPCError with codes
- Blockchain revert parsing
- User-friendly messages

## Key Files

- `routes/contract.ts` - API contract
- `orpc-client.ts` - Frontend client
- `services/*.ts` - Business logic

## Rules

- Contract-first design
- Zod validation everywhere
- Proper error codes
- Transaction receipts
- Optimistic updates
