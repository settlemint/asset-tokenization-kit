# Manage Dependencies Safely

## Purpose

Update project dependencies while ensuring stability and compatibility. Follow a
systematic approach to minimize breaking changes.

## Dependency Check Protocol

### Step 1: Analyze Current State

```bash
# Check for outdated packages
bunx npm-check-updates

# Review security vulnerabilities
bun audit

# Check bundle size impact (if relevant)
bunx bundle-phobia-cli package-name
```

### Step 2: Update Strategy

#### Safe Updates (Patch & Minor)

```bash
# Update all compatible versions
bun update

# Or update specific package
bun update package-name
```

#### Major Version Updates

Handle individually with care:

1. **Research Breaking Changes**

   ```bash
   # Check changelog
   WebSearch: "package-name changelog vX to vY"

   # Review migration guide
   WebSearch: "package-name migration guide vY"
   ```

2. **Update Package**

   ```bash
   bun add package-name@latest
   ```

3. **Fix Breaking Changes**

   - Update imports/syntax
   - Modify configuration
   - Refactor deprecated APIs

4. **Verify Functionality**

   ```bash
   # Run type checking
   bun run typecheck

   # Run tests
   bun test

   # Run full CI suite
   bun run ci
   ```

### Step 3: Dependency Groups

Handle related packages together:

```bash
# React ecosystem
bun update react react-dom @types/react @types/react-dom

# Build tools
bun update typescript @types/node
```

### Step 4: Post-Update Checklist

- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Application builds successfully
- [ ] No console errors in development
- [ ] Bundle size acceptable
- [ ] Performance not degraded

## Common Issues & Solutions

| Issue                      | Solution                                  |
| -------------------------- | ----------------------------------------- |
| Type definition conflicts  | Update all @types packages together       |
| Peer dependency warnings   | Check version compatibility matrix        |
| Build failures             | Clear cache: `rm -rf node_modules .turbo` |
| Test failures after update | Check for API changes in test utilities   |

## Renovate Integration

If Renovate is configured:

- Review grouped updates in PRs
- Check CI status before merging
- Monitor for auto-merge eligibility

## Best Practices

1. **Update Regularly** - Small, frequent updates are easier than large jumps
2. **Group Related** - Update ecosystem packages together
3. **Test Thoroughly** - Don't trust major version "drop-in" claims
4. **Document Changes** - Note any config or code changes required
5. **Use Lock Files** - Commit bun.lockb for reproducible installs
