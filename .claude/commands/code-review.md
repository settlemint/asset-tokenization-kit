# /code-review

Review the changes in this PR/branch/un-committed changes like Linus Torvalds
that is reviewing a kernel patch.

# Explore

First, use parallel subagents to find and read all files that may be useful for
this review, either as examples or as edit targets. The subagents should return
relevant file paths, and any other info that may be useful. If you are not sure
about something, ask the user for clarification.

Compare the changes to the previous version of the codebase in origin/main and
explore how the logic has changed. If there are changes to the codebase, you
should explore the changes to the codebase.

Search previous PRs for similar changes and see if there are any patterns or
best practices that can be applied.

Make sure to read the @CLAUDE.md file to understand the conventions of this
repo.

# Review

Next, ultrathink and write up a detailed code review in the Linus style. Use
your judgement as to what is necessary, given the standards of this repo.

Do cover the following topics:

- Code quality and best practices
- Potential bugs or issues
- Performance considerations
- Security concerns

## Critical Patterns to Check:

### Error Handling & Exception Safety

- Check ALL async operations have proper try-catch blocks, especially in
  mutation callbacks
- Verify promise rejections are caught and handled appropriately
- Ensure custom error types are used instead of panic errors for expected
  failures
- Check that error messages are user-friendly and don't expose implementation
  details

### API Contract Violations

- Verify GraphQL query parameters match expected schemas exactly
- Check array operators receive array values, scalar operators receive scalars
- Ensure route handlers match their defined contracts
- Validate that API responses match their declared types

### Type Safety

- Check for proper schema validators (e.g., ethereumAddress instead of
  z.string() for addresses)
- Verify TypeScript types match runtime schemas
- Look for any use of 'any' type or type assertions that bypass safety
- Ensure proper null/undefined handling

### Performance & Query Patterns

- Check queries have proper pagination parameters to avoid hitting default
  limits
- Look for N+1 query patterns or inefficient data fetching
- Check for missing indexes on frequently queried fields

### Configuration & Build Safety

- Verify no unintended changes to build configurations
- Check for accidental version downgrades
- Validate environment-specific configurations

### Kubernetes/Helm Templates

- Verify templates generate valid YAML
- Check init containers properly populate data
- Ensure ConfigMaps are correctly referenced and mounted
- Validate resource limits and requests

### Logic & Control Flow

- Check for off-by-one errors and boundary conditions
- Verify arithmetic operations won't underflow/overflow
- Ensure navigation flows aren't interrupted by errors
- Check that async operations complete in the correct order

### User Experience Impact

- Consider how errors affect the end user
- Check that loading states are properly handled
- Verify success/failure feedback is clear
- Ensure no operations fail silently

If there are things you are not sure about, use parallel subagents to do
extensive web and MCP research. They should only return useful information, no
noise.

# Write up your work

When you are happy with your work, write up the review (be concise and brutally
honest, but keep the profanity to a minimum). Do not implement anything on your
own volition, it is as the users discretion

# Self-Learning & Pattern Recognition

During code reviews, automatically capture and integrate learnings:

## Learning Integration Process

1. **Pattern Detection**: Identify recurring issues, conventions, or project-specific patterns
2. **Silent Documentation**: Add learnings directly to this file under "Learned Patterns" section
3. **Global Patterns**: If a pattern applies project-wide, update CLAUDE.md instead
4. **No User Interruption**: Integrate learnings silently - user will review in PR

## Categories to Learn

- Recurring code issues specific to this codebase
- Team conventions not yet documented
- Common security/performance anti-patterns
- Project-specific best practices
- Frequently missed edge cases

## Learned Patterns

<!-- AI will append learned patterns here automatically -->
<!-- Format: ### Pattern Name
     Context: Where this applies
     Issue: What to look for
     Fix: How to address it
     Example: Code snippet if relevant -->
