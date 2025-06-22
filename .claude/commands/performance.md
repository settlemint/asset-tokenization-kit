# Performance Analysis and Optimization

## Purpose
Identify and resolve performance bottlenecks in the application using data-driven analysis.

## Performance Audit Workflow

### Step 1: Establish Baseline
Measure current performance metrics:

```bash
# Build size analysis
bun run build
du -sh dist/* | sort -h

# Bundle analysis (if configured)
bun run analyze

# Lighthouse CI (for web apps)
bunx lighthouse https://localhost:3000 --view
```

### Step 2: Identify Bottlenecks

#### Frontend Performance
```javascript
// Add performance marks
performance.mark('myFeature-start');
// ... code to measure ...
performance.mark('myFeature-end');
performance.measure('myFeature', 'myFeature-start', 'myFeature-end');

// Log results
console.table(performance.getEntriesByType('measure'));
```

#### Backend Performance
```typescript
// Simple timing wrapper
async function timeFunction<T>(
  name: string, 
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    console.log(`${name}: ${performance.now() - start}ms`);
  }
}
```

#### Database Queries
```sql
-- Enable query timing (PostgreSQL)
\timing on

-- Analyze query execution
EXPLAIN ANALYZE SELECT ...;
```

### Step 3: Common Optimizations

#### Code Splitting
```typescript
// Dynamic imports for large features
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Route-based splitting
const AdminPanel = lazy(() => import('./routes/AdminPanel'));
```

#### Memoization
```typescript
// React components
const ExpensiveComponent = memo(({ data }) => {
  const processed = useMemo(() => 
    heavyProcessing(data), [data]
  );
  return <div>{processed}</div>;
});

// Pure functions
const memoizedFn = memoize(expensiveCalculation);
```

#### Asset Optimization
```bash
# Image optimization
bunx sharp-cli optimize images/* --output dist/images

# Preload critical assets
<link rel="preload" href="/font.woff2" as="font" crossorigin>
```

### Step 4: Monitoring

Add performance monitoring:

```typescript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics endpoint
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Step 5: Optimization Checklist

#### Build Optimizations
- [ ] Tree shaking enabled
- [ ] Minification active
- [ ] Source maps in production
- [ ] Compression (gzip/brotli)
- [ ] Dead code elimination

#### Runtime Optimizations
- [ ] Lazy loading implemented
- [ ] Virtualization for long lists
- [ ] Debounced search/filter inputs
- [ ] Optimistic UI updates
- [ ] Service worker caching

#### Asset Optimizations
- [ ] Images properly sized
- [ ] Next-gen formats (WebP/AVIF)
- [ ] Font subsetting
- [ ] Critical CSS inlined
- [ ] Unused CSS removed

## Performance Budget

Set and enforce limits:

```json
{
  "budgets": [{
    "type": "bundle",
    "name": "main",
    "maximumWarning": "300kb",
    "maximumError": "500kb"
  }]
}
```

## Profiling Commands

```bash
# CPU profiling (Node.js)
node --cpu-prof index.js

# Memory profiling
node --heap-prof index.js

# Chrome DevTools
bun --inspect index.ts
```

## Remember

> "Premature optimization is the root of all evil" - Donald Knuth

Always:
1. Measure first
2. Optimize the actual bottleneck
3. Verify the improvement
4. Document why the optimization was needed