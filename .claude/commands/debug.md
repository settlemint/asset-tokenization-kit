# Advanced Debugging Protocol

## Purpose
Systematically debug complex issues using advanced techniques and tools available in the development environment.

## Quick Debug Checklist

- [ ] Error message captured completely
- [ ] Stack trace analyzed
- [ ] Recent changes reviewed (`git diff`)
- [ ] Environment variables checked
- [ ] Dependencies up to date
- [ ] Cache cleared if relevant

## Debugging Strategies by Problem Type

### Type Errors / Compilation Issues

```bash
# Full type check with details
bun run typecheck --noEmit --pretty

# Find type error source
bun run typecheck --listFiles | grep -B5 -A5 "error"

# Generate type declarations
bun run tsc --declaration --emitDeclarationOnly
```

### Runtime Errors

#### Browser Debugging
```javascript
// Strategic console logging
console.group('Component Render');
console.log('Props:', props);
console.log('State:', state);
console.trace('Call stack');
console.groupEnd();

// Breakpoint with condition
debugger; // Only stops if condition met
if (user.role === 'admin') debugger;

// Performance debugging
console.time('expensive-operation');
// ... code ...
console.timeEnd('expensive-operation');
```

#### Node.js Debugging
```bash
# Run with inspector
bun --inspect index.ts

# With immediate break
bun --inspect-brk index.ts

# Connect via Chrome DevTools
# Navigate to: chrome://inspect
```

### Network Issues

```javascript
// Intercept all fetch requests
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  console.log('Fetch:', args);
  const response = await originalFetch(...args);
  console.log('Response:', response.status, response);
  return response;
};

// Monitor WebSocket connections
const ws = new WebSocket(url);
ws.addEventListener('message', (event) => {
  console.log('WS Received:', event.data);
});
ws.addEventListener('error', console.error);
```

### State Management Issues

```javascript
// Redux DevTools
window.__REDUX_DEVTOOLS_EXTENSION__?.({
  trace: true,
  traceLimit: 25
});

// React Developer Tools
// In console: $r (selected component)
// $r.props, $r.state, $r.hooks

// Zustand debugging
import { devtools } from 'zustand/middleware';
const useStore = create(devtools(storeDefinition));
```

### Memory Leaks

```javascript
// Take heap snapshots
// Chrome DevTools > Memory > Heap Snapshot

// Monitor specific objects
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry);
  }
});
observer.observe({ entryTypes: ['measure', 'navigation'] });

// Detect detached DOM nodes
const checkForLeaks = () => {
  const nodes = document.querySelectorAll('*');
  console.log('DOM nodes:', nodes.length);
};
setInterval(checkForLeaks, 5000);
```

### Database/Query Issues

```sql
-- PostgreSQL query analysis
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;

-- Show slow queries
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

```typescript
// Log all database queries (Prisma example)
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Or with event handlers
prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Duration: ' + e.duration + 'ms');
});
```

## Advanced Debugging Tools

### Source Map Explorer
```bash
# Analyze bundle composition
bunx source-map-explorer dist/*.js
```

### Error Boundary Implementation
```typescript
class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
    // Send to error tracking service
  }
}
```

### Custom Debug Utilities
```typescript
// Debug logger with namespaces
const debug = (namespace: string) => {
  const enabled = localStorage.getItem('DEBUG')?.includes(namespace);
  return (...args: any[]) => {
    if (enabled) console.log(`[${namespace}]`, ...args);
  };
};

const log = debug('myapp:api');
log('Making request', { url, params }); // Only logs if enabled
```

### Git Bisect for Regression
```bash
# Find when bug was introduced
git bisect start
git bisect bad                 # Current version is bad
git bisect good v1.0.0        # v1.0.0 was good

# Git will checkout commits to test
# After each test:
git bisect good  # or
git bisect bad

# When done:
git bisect reset
```

## Debug Output Best Practices

1. **Use Descriptive Labels**
   ```javascript
   console.log('API Response:', response); // Good
   console.log(response);                  // Bad
   ```

2. **Group Related Logs**
   ```javascript
   console.group('User Authentication');
   console.log('Token:', token);
   console.log('Expires:', expiresAt);
   console.groupEnd();
   ```

3. **Clean Up Debug Code**
   ```javascript
   // Use conditional compilation
   if (process.env.NODE_ENV === 'development') {
     console.log('Debug info:', data);
   }
   ```

4. **Temporary Debug Helpers**
   ```javascript
   // Add to window for console access
   if (typeof window !== 'undefined') {
     window.DEBUG = { store, api, config };
   }
   ```

## Remember

The best debugger is a well-placed console.log, but the second best is knowing when to use proper debugging tools.