# oRPC Module

## Stack

oRPC | Zod | Drizzle | Better Auth | SettleMint Portal

## Architecture

<example>
# Router Hierarchy
publicProcedure     # No auth
baseProcedure       # Auth required  
onboardedProcedure  # KYC complete
contractProcedure   # Blockchain ops
</example>

<example>
# Context Access
ctx.user       # Authenticated user
ctx.db         # Drizzle ORM
ctx.portal     # SettleMint API
ctx.blockchain # Web3 clients
</example>

## Key Patterns

<example>
# Procedure Definition
.input(z.object({ id: z.string() }))
.output(TokenSchema)
.handler(async ({ ctx, input }) => {
  return ctx.db.query.tokens.findFirst({ where: eq(tokens.id, input.id) })
})
</example>

<example>
# Error Handling
throw new ORPCError({ 
  code: "NOT_FOUND", 
  message: "Token not found" 
})
</example>

## Structure

```
procedures/     # Router definitions
middlewares/    # Auth, RBAC, Portal
helpers/        # Transaction receipts, 2FA
services/       # Business logic
```

## Rules

- Contract-first design (routes/contract.ts)
- Zod validation on all inputs/outputs
- Return transaction receipts for blockchain ops
- User-friendly error messages
