# ORPC API - AI Assistant Guidelines

This document provides AI-specific instructions for working with the ORPC API
implementation.

## Critical Context

The ORPC folder contains the complete API implementation for the Asset
Tokenization Kit. When modifying or extending this API:

1. **README Reference**: Comprehensive documentation is available in
   [README.md](./README.md)
2. **Contract-First**: Always define contracts before implementing handlers
3. **Type Safety**: Leverage TypeScript inference from Zod schemas
4. **Middleware Composition**: Use the appropriate router for security
   requirements

## Key Patterns to Follow

### Adding New Endpoints

When asked to add new API endpoints:

1. **Check Existing Structure**: Look for similar endpoints first
2. **Follow Module Pattern**: Contract → Schema → Handler → Router
3. **Use Appropriate Router**: publicRouter, authRouter, onboardedRouter, or
   tokenRouter
4. **Lazy Load Routes**: Always use lazy loading in the main router

### Schema Definitions

```typescript
// Always use descriptive schemas with proper validation
export const MySchema = z.object({
  field: z.string().min(1).describe("Clear description of the field"),
  optional: z.number().optional().describe("Optional fields should be marked"),
});
```

### Error Handling

```typescript
// Use the errors object from context
throw errors.BAD_REQUEST("User-friendly error message");
throw errors.FORBIDDEN("Permission denied");
throw errors.NOT_FOUND("Resource not found");
```

## Common Pitfalls to Avoid

1. **Don't Skip Validation**: Always validate inputs with Zod schemas
2. **Don't Ignore Context**: Use injected services from middleware
3. **Don't Create Barrel Exports**: No index.ts files for exports
4. **Don't Mix Concerns**: Keep business logic in handlers, not middleware
5. **Don't Use console.log**: Use createLogger() from SDK utils

## Migration Path

When updating the API:

1. **Database Changes**: Always run migrations after schema changes

   ```bash
   bun run db:generate
   bun run db:migrate
   ```

2. **Contract Updates**: Update both contract.ts and router.ts

3. **Type Generation**: Run codegen after contract changes
   ```bash
   bun run codegen
   ```

## Testing Requirements

1. **Unit Tests**: Test handlers with mock context
2. **Integration Tests**: Test full request flow when adding features
3. **Type Tests**: Ensure type inference works correctly

## Performance Considerations

1. **Use Lazy Loading**: All routes should be lazy loaded
2. **Optimize Queries**: Use proper database indexes and limits
3. **Cache When Possible**: Leverage TanStack Query caching
4. **Batch Operations**: Support batch endpoints for efficiency

## Security Checklist

- [ ] Use appropriate router (public vs auth)
- [ ] Validate all inputs with Zod
- [ ] Check permissions in handlers
- [ ] Sanitize user-generated content
- [ ] Log security-relevant events
- [ ] Handle errors gracefully

## MCP Tool Integration

When working with ORPC:

1. **Use Gemini-CLI** for analyzing existing patterns before adding features
2. **Check Context7** for ORPC framework updates and best practices
3. **Search with Grep** for examples of similar implementations
4. **Update Linear** tickets when completing API changes

## Important Notes

- The ORPC client is isomorphic (works on server and client)
- Server-side uses direct router calls for performance
- Client-side uses HTTP with automatic cookie handling
- All endpoints support OpenAPI documentation generation
- Middleware order matters - check the composition carefully

## Quick Reference

```typescript
// Public endpoint
export const handler = publicRouter.namespace.method.handler(async () => {});

// Authenticated endpoint
export const handler = authRouter.namespace.method.handler(
  async ({ context }) => {
    const userId = context.auth.user.id; // Guaranteed to exist
  }
);

// With service injection
export const handler = authRouter
  .use(dbMiddleware)
  .use(theGraphMiddleware)
  .namespace.method.handler(async ({ context }) => {
    // Use context.db and context.theGraphClient
  });
```
