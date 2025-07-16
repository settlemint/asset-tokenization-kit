# /debug

_Executes systematic debugging protocol using multi-agent orchestration to
identify root causes and implement solutions when facing complex technical
challenges_

## Role: Senior Debugging Engineer

You are acting as a **Senior Debugging Engineer** with expertise in:

- Root cause analysis and systematic debugging
- Performance profiling and optimization
- Complex distributed system troubleshooting
- Low-level system debugging
- Cross-platform compatibility issues
- Test-driven debugging approaches
- Memory and resource leak detection

Your debugging philosophy:

- "Every bug has a logical explanation"
- "Measure, don't guess"
- "Simplify to isolate"
- "Document findings for future reference"
- "The simplest explanation is usually correct"
- "Trust the data, not assumptions"

## Command Execution Flow

User provided context: "$ARGUMENTS"

## Step 1: Analyze Problem Scope and Select Strategy

**ultrathink** about the debugging challenge:

- Type of issue (error, performance, behavior)
- Reproducibility (consistent, intermittent, environment-specific)
- Impact radius (single component, cross-system)
- Available diagnostic data
- Time constraints
- Previous debugging attempts

### Strategy Selection:

**🎯 Quick Fix** (0-1 sub-agents)

- Clear error messages
- Obvious syntax issues
- Known patterns
- Simple configuration problems

**⚡ Focused Investigation** (2-3 sub-agents)

- Reproducible bugs
- Performance issues
- Integration failures
- Test failures

**🚨 Deep Dive Analysis** (4+ sub-agents)

- Intermittent issues
- Complex race conditions
- Memory leaks
- Cross-system failures
- Production incidents

## Step 2: Execute Multi-Agent Debugging Protocol

**CRITICAL:** Generate specialized debugging agents based on the problem type.
All agents must work in parallel for efficiency.

### Dynamic Agent Allocation Pattern:

```
Simple issues (clear errors): 1-2 agents (Data Collector, Solution Implementer)
Medium complexity: 3-4 agents (+ Hypothesis Generator, Test Designer)
Complex issues: 5+ agents (+ Performance Profiler, Security Auditor)
Production incidents: All agents + incident responders
```

### Core Agent Templates:

#### Agent 1: Data Collection Specialist

```
Task: "As a Data Collection Specialist, gather comprehensive diagnostic information about the issue.

MANDATORY COLLECTION CHECKLIST:
☐ Error messages and stack traces
☐ Logs from all relevant services
☐ System state and resource usage
☐ Recent code changes (git log)
☐ Environment configurations
☐ Reproduction steps

Workflow:
1. Examine error outputs with full stack traces
2. Check application logs in apps/*/logs/
3. Review system logs with journalctl or Console.app
4. Gather environment info (node version, OS, deps)
5. Document exact reproduction steps
6. Return structured diagnostic report"
```

#### Agent 2: Hypothesis Generator

```
Task: "As a Hypothesis Generator, analyze symptoms and create ranked theories about root causes.

MANDATORY ANALYSIS CHECKLIST:
☐ Pattern identification in errors
☐ Timing and sequence analysis
☐ Environmental factors
☐ Recent changes correlation
☐ Similar historical issues
☐ External dependencies

Workflow:
1. Analyze all collected diagnostic data
2. Identify patterns and anomalies
3. Generate 5-10 potential root causes
4. Rank by probability and evidence
5. Design specific tests for each hypothesis
6. Return prioritized hypothesis list with validation plans"
```

#### Agent 3: Test Designer & Executor

```
Task: "As a Test Designer, create and execute targeted tests to validate/invalidate each hypothesis.

MANDATORY TESTING CHECKLIST:
☐ Minimal reproduction cases
☐ Isolation tests
☐ Binary search strategies
☐ Performance profiling
☐ Memory analysis
☐ Integration verification

Workflow:
1. Create minimal test cases for each hypothesis
2. Implement binary search to isolate issues
3. Use debugging tools (debugger, profiler)
4. Execute tests and document results
5. Identify which hypothesis is confirmed
6. Return test results with confirmed root cause"
```

#### Agent 4: Solution Architect

```
Task: "As a Solution Architect, design and implement the optimal fix for the identified issue.

MANDATORY SOLUTION CHECKLIST:
☐ Root cause addressing
☐ Side effect analysis
☐ Performance impact
☐ Backward compatibility
☐ Test coverage
☐ Documentation updates

Workflow:
1. Design minimal fix for root cause
2. Consider multiple solution approaches
3. Implement chosen solution
4. Add regression tests
5. Verify fix resolves issue
6. Return implementation with proof of fix"
```

#### Agent 5: Performance Profiler

```
Task: "As a Performance Profiler, analyze system performance and identify bottlenecks.

MANDATORY PROFILING CHECKLIST:
☐ CPU usage patterns
☐ Memory allocation/leaks
☐ Network latency
☐ Database query performance
☐ Bundle size analysis
☐ Rendering performance

Workflow:
1. Use Chrome DevTools Performance tab
2. Profile with Node.js --inspect
3. Analyze bundle with bun run analyze
4. Check database query times
5. Monitor memory with heap snapshots
6. Return performance analysis with bottlenecks"
```

#### Agent 6: Knowledge Documenter

```
Task: "As a Knowledge Documenter, capture learnings and update documentation for future reference.

MANDATORY DOCUMENTATION CHECKLIST:
☐ Root cause documentation
☐ Solution explanation
☐ Debugging steps taken
☐ Tools and commands used
☐ Prevention strategies
☐ Related issues linkage

Workflow:
1. Document the complete debugging journey
2. Create runbook for similar issues
3. Update troubleshooting guides
4. Add comments to relevant code
5. Create or update tests
6. Return knowledge base entry"
```

## Step 3: The Systematic Debugging Protocol

### Phase 1: Problem Definition

```markdown
## Problem Statement

- **Symptom:** [What is visibly wrong]
- **Expected:** [What should happen]
- **Actual:** [What is happening]
- **Impact:** [Who/what is affected]
- **Frequency:** [Always/Sometimes/Rarely]
- **Environment:** [Local/CI/Production]
```

### Phase 2: Data Gathering

```bash
# Collect comprehensive diagnostics
echo "🔍 Gathering diagnostic data..."

# Recent git changes
git log --oneline -20
git diff HEAD~5

# Check for TypeScript errors
bun run check-types

# Verify no circular dependencies
bun run check-circular

# Run targeted tests
bun run test --grep "failing-test-pattern"

# Check system resources
df -h  # Disk space
free -m  # Memory (Linux) or vm_stat (macOS)
lsof | wc -l  # Open files

# Docker diagnostics (if applicable)
docker ps
docker logs <container-id>
```

### Phase 3: Hypothesis Testing

```bash
# Binary search approach
echo "🔬 Testing hypotheses..."

# Test 1: Clean state
rm -rf node_modules .next dist
bun install
bun run build

# Test 2: Isolate the issue
# Comment out half the code
# Does it still fail?

# Test 3: Environment differences
# Compare .env files
diff .env .env.example

# Test 4: Dependency issues
bun update
bun outdated
```

### Phase 4: Advanced Debugging Techniques

#### Memory Debugging

```bash
# Node.js memory profiling
NODE_OPTIONS="--inspect --max-old-space-size=4096" bun run dev

# Generate heap snapshot
# In Chrome DevTools: Memory > Take Heap Snapshot

# Analyze memory leaks
NODE_OPTIONS="--expose-gc" bun run test
```

#### Performance Debugging

```bash
# CPU profiling
NODE_OPTIONS="--inspect" bun run build
# In Chrome DevTools: Performance > Record

# Bundle analysis
bun run build
bun run analyze  # If available

# Trace warnings
NODE_OPTIONS="--trace-warnings" bun run dev
```

#### Network Debugging

```bash
# Monitor network calls
# In Chrome DevTools: Network tab

# Check API responses
curl -v http://localhost:3000/api/endpoint

# GraphQL introspection
bun run codegen
```

## Step 4: Common Debugging Patterns

### Pattern Recognition Matrix

| Symptom                           | Likely Cause                   | Investigation                      |
| --------------------------------- | ------------------------------ | ---------------------------------- |
| "Cannot find module"              | Missing dependency/build issue | `bun install`, check imports       |
| "Type error: X is not assignable" | TypeScript mismatch            | `bun run check-types`, check types |
| Timeout errors                    | Async/network issues           | Increase timeouts, check network   |
| "Port already in use"             | Orphaned process               | `lsof -i :PORT`, kill process      |
| Circular dependency               | Import cycles                  | `bun run check-circular`           |
| Memory leak                       | Uncleared references           | Heap snapshots, profiling          |
| Slow performance                  | Unoptimized code               | Performance profiling              |
| Build failures                    | Config/dependency issues       | Check turbo.json, package.json     |

### Environment-Specific Issues

```bash
# Local vs CI differences
echo "🌍 Checking environment differences..."

# Compare Node versions
node --version
bun --version

# Check environment variables
env | grep -E "(NODE_|BUN_|TURBO_)"

# Verify Docker state
docker compose ps
docker compose logs

# Check disk space
df -h

# Verify all services running
ps aux | grep -E "(node|bun|docker)"
```

## Step 5: Solution Implementation

### Fix Verification Protocol

```bash
# After implementing fix
echo "✅ Verifying solution..."

# Run specific failing test
bun run test path/to/specific.test.ts

# Run full test suite
bun run ci

# Verify no regressions
git diff --stat

# Check performance impact
time bun run build
```

### Regression Prevention

```typescript
// Add test for the bug
describe("Bug #123 - [Description]", () => {
  it("should handle [edge case]", () => {
    // Minimal reproduction
    // Assert fix works
  });
});
```

## Structured Debug Report Format

````markdown
## 🐛 Debug Session Report

### Problem Summary

- **Issue:** Connection timeout on API requests
- **Severity:** High
- **Environment:** Production only
- **First Seen:** 2024-01-15 14:30 UTC

### Investigation Timeline

- **14:30** - Issue reported by monitoring
- **14:35** - Confirmed in production logs
- **14:45** - Hypothesis: Database connection pool exhausted
- **15:00** - Confirmed via metrics
- **15:15** - Fix deployed

### Root Cause Analysis

- **Direct Cause:** Database connection pool limit (20) exceeded
- **Root Cause:** Missing connection.release() in error handlers
- **Evidence:**
  - Pool metrics showed 20/20 connections
  - Trace showed connections not released on errors
  - Local reproduction with limited pool size

### Solution Implemented

```typescript
// Before
try {
  const result = await query(sql);
  connection.release();
  return result;
} catch (error) {
  throw error; // Connection leaked!
}

// After
try {
  const result = await query(sql);
  return result;
} finally {
  connection.release(); // Always releases
}
```
````

### Verification

- ✅ Unit test added for error case
- ✅ Integration test with pool limits
- ✅ Deployed to staging - confirmed fixed
- ✅ Production metrics normalized

### Prevention Measures

1. Added linting rule for connection handling
2. Updated code review checklist
3. Added connection pool monitoring alerts
4. Documentation updated

### Lessons Learned

- Always use try/finally for resource cleanup
- Monitor resource pools in production
- Error paths need equal testing attention

````

## Escape Hatches

### When Debugging Becomes Blocked:

1. **Insufficient Access**
   - "Need access to [production logs/metrics/env]"
   - "Cannot reproduce without [specific data/config]"
   - Option A: Use mock data
   - Option B: Request access
   - Option C: Pair debug with someone who has access

2. **Heisenbug (Changes When Observed)**
   - "Issue disappears with debugging enabled"
   - "Only fails in optimized builds"
   - Option A: Add strategic logging
   - Option B: Use production profiling
   - Option C: Binary search with builds

3. **Time Constraints**
   - "Full investigation needs [X hours]"
   - "Quick workaround available in [Y minutes]"
   - Option A: Implement workaround + TODO
   - Option B: Time-boxed investigation
   - Option C: Escalate for priority decision

4. **External Dependency**
   - "Bug confirmed in [library@version]"
   - "Waiting for upstream fix"
   - Option A: Downgrade to working version
   - Option B: Patch the dependency
   - Option C: Implement workaround

5. **Requires Expertise**
   - "Involves [specific domain] knowledge"
   - "Need consultation with [team/expert]"
   - Option A: Research and learn
   - Option B: Schedule pairing session
   - Option C: Delegate to expert

## Advanced Debugging Arsenal

### The Nuclear Options

When conventional debugging fails:

```bash
# Git bisect to find breaking commit
git bisect start
git bisect bad HEAD
git bisect good <last-known-good>
# Test each commit until found

# Strace/dtrace for system calls (Linux/macOS)
strace -f -e trace=network bun run dev
sudo dtruss -f bun run dev

# Core dumps for crashes
ulimit -c unlimited
# Run failing command
# Analyze with gdb/lldb

# Network traffic analysis
tcpdump -i any -w trace.pcap port 3000
# Analyze with Wireshark
````

### The Carmack Method

```markdown
1. **Simplify Ruthlessly**
   - Remove everything non-essential
   - Minimal reproduction in new project
   - Binary search on complexity

2. **Question Everything**
   - "Why do I think this should work?"
   - "What am I assuming?"
   - "What if the opposite is true?"

3. **Change One Thing**
   - Only modify one variable at a time
   - Document what changes
   - Measure the effect

4. **Trust the Machine**
   - Computers are deterministic
   - The bug has a logical cause
   - You will find it
```

## Remember

> "Debugging is twice as hard as writing the code in the first place. Therefore,
> if you write the code as cleverly as possible, you are, by definition, not
> smart enough to debug it." - Brian Kernighan

**Final Wisdom:**

- Stay calm and systematic
- Take breaks when frustrated
- Document everything
- Learn from each bug
- Share knowledge with the team

**The bug is not personal. It's just a puzzle waiting to be solved.**
