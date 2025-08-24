# Task Completion Checklist

## MANDATORY After ANY Code Change

### 1. Run Quality Checks (CRITICAL)
```bash
# Option A: Full CI Pipeline (Recommended)
bun run ci

# Option B: Individual checks if CI fails
bun run format          # Fix formatting
bun run compile         # Ensure contracts compile
bun run codegen         # Regenerate types if needed
bun run lint            # Fix linting issues (MUST have 0 warnings)
bun run typecheck       # Fix TypeScript errors
bun run test            # Ensure tests pass
```

### 2. Check for Breaking Changes
- Verify no existing functionality is broken
- Ensure backward compatibility or update all references
- Check that generated files are up to date

### 3. Update Artifacts (if applicable)
If you modified:
- **Smart contracts** (kit/contracts)
- **Database schema** (kit/dapp/src/lib/db/schemas)
- **Subgraph** (kit/subgraph)

Then run:
```bash
bun run artifacts       # Regenerate all artifacts
bun run dev:reset       # Restart Docker with new artifacts
```

### 4. Database Migrations (if schema changed)
```bash
cd kit/dapp
bun run db:generate     # Generate migration files
bun run db:migrate      # Apply migrations (auto-runs on app start)
```

### 5. Test Your Changes
- Run relevant unit tests for modified code
- Run integration tests if API/contract changes
- Manually test the feature in the running application

### 6. Before Creating PR
- Ensure `bun run ci` passes completely
- Review git diff for unintended changes
- Verify no sensitive data in commits
- Update relevant documentation if needed

## Environment-Specific Checks

### Local Development
- Docker Compose services running (`bun run dev:up`)
- No port conflicts (8545, 5432, 5173, etc.)
- Environment variables properly set

### CI/CD Pipeline
- All GitHub Actions checks passing
- Coverage reports generated
- No security vulnerabilities in dependencies

## Common Issues to Avoid
- ❌ Don't commit with ESLint warnings (max-warnings: 0)
- ❌ Don't skip TypeScript strict mode errors
- ❌ Don't commit generated files manually (use artifacts command)
- ❌ Don't modify migration files after they're applied
- ❌ Don't commit .env.local or secrets
- ❌ Don't ignore failing tests

## Success Criteria
✅ All commands in `bun run ci` pass
✅ No TypeScript errors
✅ No ESLint warnings
✅ All tests passing
✅ Code formatted with Prettier
✅ Artifacts regenerated if needed
✅ Database migrations generated if schema changed