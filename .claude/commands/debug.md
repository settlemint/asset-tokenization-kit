# /debug

Systematic debugging approach for issues.

## Debug Workflow

```typescript
// 1. Reproduce issue
await reproduceError()

// 2. Gather context
mcp__sentry__search_issues({ query: "error message" })
mcp__linear__list_issues({ query: "bug description" })

// 3. Analyze logs
grep -r "error pattern" kit/
tail -f logs/*.log

// 4. Test fix
bun run test -- --watch affected.test.ts
```

## Common Debugging

<example>
# React hydration error
- Check server/client mismatch
- Verify data consistency
- Add suppressHydrationWarning temporarily

# Contract revert

- Check revert reason
- Verify gas limits
- Test with hardhat console

# API 500 error

- Check server logs
- Verify database connection
- Test with curl/postman </example>

## Debug Tools

- Chrome DevTools
- React Developer Tools
- Foundry debugger
- Sentry error tracking
