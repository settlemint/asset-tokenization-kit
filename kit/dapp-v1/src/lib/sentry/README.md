# Sentry Integration

This directory contains the Sentry integration for error tracking, performance
monitoring, and distributed tracing.

## Configuration

Sentry is only initialized when the `SENTRY_DSN` environment variable is set.
This allows you to:

- Disable Sentry in development by not setting the DSN
- Enable it in production/staging environments
- Run the application without any Sentry overhead when not needed

### Required Environment Variables

```env
# Server-side DSN
SENTRY_DSN=your-sentry-dsn

# Client-side DSN (same as server DSN)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# For source map uploads (CI/CD only)
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project

# Optional
NEXT_PUBLIC_SENTRY_RELEASE=your-release-version
SENTRY_DEBUG=true # Enable debug mode in development
```

## Features

### 1. React Query Integration

- Automatic error tracking for failed queries and mutations
- Query/mutation lifecycle breadcrumbs
- Performance tracking for data fetching

### 2. ORPC Integration

- Distributed tracing for all ORPC procedures
- Automatic error capturing with full context
- Performance monitoring for API calls
- User context tracking

### 3. Enhanced Error Tracking

- Structured error capture with context
- User session tracking
- Custom breadcrumbs for user actions
- Filtering of common/expected errors

### 4. Performance Monitoring

- Automatic transaction creation for API calls
- Web vitals tracking
- Database query performance
- Custom performance metrics

## Usage

### Basic Error Capture

```typescript
import { captureException } from "@/lib/sentry";

try {
  await riskyOperation();
} catch (error) {
  captureException(error, {
    operation: "risky-operation",
    metadata: { userId: user.id },
  });
}
```

### Using the React Hook

```typescript
import { useSentry } from '@/lib/sentry/use-sentry';

function MyComponent() {
  const { captureError, trackAction, monitored } = useSentry(user);

  const handleClick = monitored('button-click', async () => {
    trackAction('User clicked button');
    // Your logic here
  });

  return <button onClick={handleClick}>Click me</button>;
}
```

### Wrapping Functions with Tracing

```typescript
import { withTracing } from "@/lib/utils/sentry-tracing";

const tracedFunction = withTracing(
  "queries",
  "fetchUserData",
  async (userId: string) => {
    // Your async logic here
    return userData;
  }
);
```

### Error Boundaries

```tsx
import { SentryErrorBoundary } from "@/lib/sentry/use-sentry";

function App() {
  return (
    <SentryErrorBoundary
      fallback={(error, reset) => (
        <div>
          <h2>Something went wrong</h2>
          <button onClick={reset}>Try again</button>
        </div>
      )}
    >
      <YourApp />
    </SentryErrorBoundary>
  );
}
```

## Architecture

### Middleware Stack

1. **Sentry Tracing Middleware**: Creates spans for all ORPC procedures
2. **Error Middleware**: Enhanced with Sentry error capture
3. **Session Middleware**: Tracks user context for errors

### Integration Points

- **Next.js**: Via `@sentry/nextjs` for automatic instrumentation
- **React Query**: Custom integration in `query.client.ts`
- **ORPC**: Custom middleware in `sentry-tracing.middleware.ts`
- **Authentication**: Session tracking in auth hooks

## Best Practices

1. **Use Breadcrumbs**: Add breadcrumbs for important user actions
2. **Set User Context**: Always set user context after authentication
3. **Add Custom Context**: Include relevant business context with errors
4. **Filter Noise**: Configure `ignoreErrors` to reduce noise
5. **Performance Budgets**: Set up alerts for performance regressions

## Development

To test Sentry integration locally:

1. Set up a development project in Sentry
2. Add the DSN to your `.env.local`
3. Set `SENTRY_DEBUG=true` for verbose logging
4. Trigger errors to verify capture

## Troubleshooting

### Sentry not capturing errors

- Check if `SENTRY_DSN` is set
- Verify the DSN is correct
- Check browser console for Sentry initialization errors

### Source maps not working

- Ensure `SENTRY_AUTH_TOKEN` is set in CI
- Check build logs for source map upload errors
- Verify release versions match

### Performance issues

- Reduce `tracesSampleRate` in production
- Disable session replay if not needed
- Use `beforeSend` to filter unnecessary events
