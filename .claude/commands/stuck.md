# Problem-Solving Protocol: Getting Unstuck

## Purpose

When facing a challenging problem or feeling stuck, use this systematic approach
to break through and find solutions. Make use to ultrathink on the problem and
not just jump to conclusions.

## The Carmack Method: First Principles Thinking

### Step 1: Define the Problem Precisely

```
Current State: [What is happening now?]
Desired State: [What should be happening?]
Gap: [What exactly is preventing the transition?]
```

### Step 2: Strip Away Assumptions

- List all assumptions you're making
- Challenge each assumption: "Is this actually true?"
- Identify which assumptions are blocking progress

### Step 3: Simplify Ruthlessly

- Can you reproduce the issue in isolation?
- What's the minimal code that demonstrates the problem?
- Remove all non-essential complexity

### Step 4: Systematic Debugging Approach

1. **Gather Data**

   ```bash
   # Check logs
   tail -f logs/*.log

   # Inspect state
   console.log/debugger at key points

   # Network analysis
   Browser DevTools Network tab

   # System resources
   top/htop for CPU/memory issues
   ```

2. **Form Hypotheses**

   - List 3-5 possible causes
   - Rank by probability
   - Design tests to validate/invalidate each

3. **Binary Search**
   - Cut the problem space in half
   - Does it work without X? With X?
   - Repeat until isolated

### Step 5: Alternative Approaches

**Think Orthogonally**

- What would happen if you did the opposite?
- Can you solve a different but related problem?
- Is there a completely different architecture?

**Research Similar Problems**

```bash
# Search for similar issues
gh issue list --search "error message"
gh issue list --repo owner/repo --search "keyword"

# Check documentation
WebSearch query: "library-name specific-error"

# Review source code
Grep pattern: "error_constant|function_name"
```

### Step 6: The Rubber Duck Protocol

Explain the problem out loud as if teaching it:

1. Context: What are you trying to achieve?
2. Approach: How are you trying to solve it?
3. Failure: Where exactly does it break?
4. Attempts: What have you already tried?
5. Constraints: What limitations exist?

### Step 7: Take Strategic Breaks

- Work on a different part of the codebase
- Document what you've learned so far
- Fresh perspective after 15-30 min break

## Common Stuck Patterns & Solutions

| Pattern                      | Solution                               |
| ---------------------------- | -------------------------------------- |
| "It should work"             | Add more logging, question assumptions |
| "It worked before"           | Git bisect to find breaking commit     |
| "Works locally, fails in CI" | Environment differences, check configs |
| "Intermittent failures"      | Race conditions, add delays/locks      |
| "Performance degradation"    | Profile, measure, don't guess          |

## The Nuclear Options

If still stuck after systematic approach:

1. **Minimal Reproduction**

   - New project with just the problem
   - Share with team/community

2. **Workaround**

   - Document why direct solution blocked
   - Implement alternative approach
   - Add TODO for future fix

3. **Escalate**
   - Prepare clear problem statement
   - Show what you've tried
   - Ask for specific help

## Remember: Every Problem Has a Solution

> "It's not magic, it's just work." - John Carmack

The computer is deterministic. The bug has a cause. You will find it.
