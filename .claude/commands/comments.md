# Add Documentation Comments to PR Changes

## Purpose
Automatically add or update documentation comments (TSDoc, JSDoc, etc.) for all code changes in the current PR.

## Execution Steps

1. **Identify Changed Files**
   - Use `git diff --name-only main...HEAD` to list all modified files
   - Filter for source code files (`.ts`, `.tsx`, `.js`, `.jsx`, `.sol`, etc.)

2. **Analyze Each File**
   - For each changed file, identify:
     - New functions, classes, interfaces, or types without documentation
     - Existing documentation that needs updates due to code changes
     - Public APIs that require comprehensive documentation

3. **Add Documentation**
   - Add TSDoc/JSDoc comments following project conventions
   - Include:
     - Brief description of purpose
     - Parameter descriptions with types
     - Return value documentation
     - Example usage for complex functions
     - Any throws/errors documentation

4. **Quality Checks**
   - Ensure comments are meaningful (not just restating the obvious)
   - Verify parameter names match actual parameters
   - Check that examples are valid and helpful

## Example Output
```typescript
/**
 * Calculates the compound interest on a tokenized bond
 * @param principal - The initial investment amount in wei
 * @param rate - Annual interest rate as a percentage (e.g., 5 for 5%)
 * @param time - Investment period in years
 * @param frequency - Compounding frequency per year
 * @returns The final amount including principal and interest in wei
 * @throws {Error} If rate is negative or time is zero
 * @example
 * const finalAmount = calculateCompoundInterest(1000n, 5, 2, 12);
 */
```

## Important Notes
- DO NOT add redundant comments (e.g., `// increments i` for `i++`)
- Focus on public APIs and complex logic
- Maintain consistency with existing documentation style
- Use the Task tool to parallelize work on multiple files
