# /test

Executes test suite and auto-fixes all errors/warnings for 100% pass rate.

## Auto-Loaded Context

- @/CLAUDE.md
- @/.claude/CLAUDE.md

## Step 1: Analyze Scope

Select strategy:

- 🎯 Quick: Minor changes
- ⚡ Standard: Features/APIs
- 🚨 Comprehensive: Major releases

## Step 2: Execute QA

Use `bun run ci` for all tests, analysis, coverage.

```bash
echo "🚀 Running CI..."
bun run ci
```

## Step 3: Auto-Resolution

Fix test failures, types, lints, imports, coverage gaps until CI passes clean.

## Minimal Output

To save tokens, output only:

- Pass/Fail status
- Fixed issues summary
- Final grade No full report.

## Escape Hatches

- Fix flakies: Add waits/mocks
- Env diffs: Mock deps
- Types/Lints: Resolve all
- Imports: Fix paths
- Assertions: Update/fix bugs

## Advanced Patterns

- CI: Incremental, parallel, smart selection.

## Gate Enforcement

- [ ] 100% tests
- [ ] Coverage thresholds
- [ ] 0 errors/warnings
- [ ] Performance ok
- [ ] Security clean
- [ ] Score ≥ B

Fix everything until CI passes completely.
