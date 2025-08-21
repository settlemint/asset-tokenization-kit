/**
 * Expression Builder Utility Functions
 *
 * @remarks
 * This module provides utility functions for manipulating and validating compliance
 * expressions in the UI. These expressions define complex business rules for token
 * operations using a visual builder interface that generates machine-readable logic.
 *
 * EXPRESSION ARCHITECTURE:
 * - ExpressionWithGroups: UI-friendly format with parentheses for grouping
 * - Validation delegates to Zod schema for consistency with backend
 * - Immutable operations return new arrays to prevent UI state corruption
 * - Group counting enables real-time UI feedback for balanced parentheses
 *
 * USE CASES:
 * - Compliance rule builder for token restrictions
 * - KYC requirement expressions for investor verification
 * - Complex business logic for fund management rules
 * - Regulatory compliance expressions for different jurisdictions
 *
 * @see {@link ExpressionWithGroups} UI expression format with grouping support
 * @see {@link validateExpressionWithGroups} Zod-based validation logic
 */

import {
  type ExpressionWithGroups,
  validateExpressionWithGroups,
} from "@atk/zod/expression-node";

/**
 * Validates a UI expression for syntactic correctness and logical completeness.
 *
 * @remarks
 * VALIDATION STRATEGY: This function serves as a bridge between the UI expression
 * builder and the backend validation logic. It ensures expressions are valid
 * before they're encoded for smart contract deployment.
 *
 * WHY DELEGATE TO ZOD: The validateExpressionWithGroups function contains the
 * authoritative validation logic that matches what the backend expects. This
 * prevents validation drift between UI and API layers.
 *
 * EMPTY EXPRESSION HANDLING: Empty expressions are invalid because they don't
 * represent any business logic. This prevents deployment of meaningless rules.
 *
 * @param expression - The expression array to validate (topics, operators, and groups)
 * @returns true if the expression is syntactically valid and logically complete
 * @example
 * ```typescript
 * // Valid expression: "country IS US AND age GREATER_THAN 18"
 * const validExpression = [
 *   { nodeType: 0, value: 1 }, // country topic
 *   { nodeType: 1, value: 0 }, // IS operator
 *   { nodeType: 2, value: 840 }, // US country code
 *   { nodeType: 3, value: 0 }, // AND logical operator
 *   { nodeType: 0, value: 2 }, // age topic
 *   { nodeType: 1, value: 2 }, // GREATER_THAN operator
 *   { nodeType: 2, value: 18 } // age value
 * ];
 * validateUIExpression(validExpression); // returns true
 *
 * // Invalid expression: incomplete logic
 * const invalidExpression = [
 *   { nodeType: 0, value: 1 }, // country topic (missing operator and value)
 * ];
 * validateUIExpression(invalidExpression); // returns false
 *
 * // Empty expression: no business logic
 * validateUIExpression([]); // returns false
 * ```
 */
export function validateUIExpression(
  expression: ExpressionWithGroups
): boolean {
  // EARLY RETURN: Empty expressions represent no business logic and are invalid
  if (expression.length === 0) return false;

  // DELEGATION: Use authoritative Zod validation to ensure UI/backend consistency
  // WHY: Prevents validation logic duplication and ensures expressions that pass
  // UI validation will also pass backend validation during smart contract deployment
  return validateExpressionWithGroups(expression);
}

/**
 * Removes one or more items from an expression array at specified indices.
 *
 * @remarks
 * IMMUTABILITY: This function returns a new array rather than modifying the input,
 * which is essential for React state management and prevents UI corruption.
 *
 * FLEXIBLE REMOVAL: Supports both single index removal (for individual item deletion)
 * and multi-index removal (for bulk operations like clearing grouped items).
 *
 * PERFORMANCE CONSIDERATION: For single removals, uses splice for O(n) performance.
 * For multi-removals, uses filtering to handle arbitrary index patterns efficiently.
 *
 * @param expression - The expression array to remove items from
 * @param index - Single index or array of indices to remove
 * @returns New expression array with specified items removed
 * @example
 * ```typescript
 * const expression = [
 *   { nodeType: 0, value: 1 }, // index 0
 *   { nodeType: 1, value: 0 }, // index 1
 *   { nodeType: 2, value: 840 }, // index 2
 *   { nodeType: 3, value: 0 }, // index 3
 * ];
 *
 * // Remove single item
 * const withoutIndex1 = removeItemAtIndex(expression, 1);
 * // Result: [{ nodeType: 0, value: 1 }, { nodeType: 2, value: 840 }, { nodeType: 3, value: 0 }]
 *
 * // Remove multiple items
 * const withoutIndices = removeItemAtIndex(expression, [0, 2]);
 * // Result: [{ nodeType: 1, value: 0 }, { nodeType: 3, value: 0 }]
 *
 * // Remove grouped parentheses
 * const withGroups = ["(", ...expression, ")"];
 * const withoutGroups = removeItemAtIndex(withGroups, [0, withGroups.length - 1]);
 * // Result: original expression without surrounding parentheses
 * ```
 */
export function removeItemAtIndex(
  expression: ExpressionWithGroups,
  index: number | number[]
): ExpressionWithGroups {
  if (typeof index === "number") {
    // SINGLE REMOVAL: Use splice for simple case with good performance
    // WHY: Array.splice is optimized for single-item removal and maintains order
    const newExpression = [...expression];
    newExpression.splice(index, 1);
    return newExpression;
  }

  // MULTI-REMOVAL: Use filtering approach for arbitrary index patterns
  // WHY: Handles complex removal patterns like non-contiguous indices
  // and grouped deletions that would be cumbersome with multiple splice calls
  const newExpression: ExpressionWithGroups = [];
  for (const [currentIndex, item] of expression.entries()) {
    if (index.includes(currentIndex)) {
      continue; // Skip items marked for removal
    }
    newExpression.push(item);
  }
  return newExpression;
}

/**
 * Counts the number of unclosed opening parentheses in an expression.
 *
 * @remarks
 * UI FEEDBACK: This function enables real-time validation feedback in the expression
 * builder UI. Users can see when they have unbalanced parentheses and need to add
 * closing groups to complete their expression.
 *
 * ALGORITHM: Simple counter that increments for opening parentheses and decrements
 * for closing parentheses. The final count represents unclosed groups.
 *
 * VALIDATION INTEGRATION: Used by the UI to determine when to show "End Group"
 * buttons and to validate expression completeness before submission.
 *
 * @param expression - The expression array to analyze for group balance
 * @returns Number of unclosed opening parentheses (0 means balanced)
 * @example
 * ```typescript
 * // Balanced expression: "((A AND B) OR (C AND D))"
 * const balanced = ["(", "(", "A", "AND", "B", ")", "OR", "(", "C", "AND", "D", ")", ")"];
 * getOpenGroupCount(balanced); // returns 0 (balanced)
 *
 * // Unbalanced expression: "((A AND B) OR (C AND D"
 * const unbalanced = ["(", "(", "A", "AND", "B", ")", "OR", "(", "C", "AND", "D"];
 * getOpenGroupCount(unbalanced); // returns 2 (two unclosed groups)
 *
 * // No groups: "A AND B"
 * const noGroups = ["A", "AND", "B"];
 * getOpenGroupCount(noGroups); // returns 0 (no groups to balance)
 *
 * // UI usage: show "End Group" button when count > 0
 * const showEndGroupButton = getOpenGroupCount(currentExpression) > 0;
 * ```
 */
export function getOpenGroupCount(expression: ExpressionWithGroups): number {
  let count = 0;
  for (const item of expression) {
    if (item === "(")
      count++; // Opening parenthesis increases nesting level
    else if (item === ")") count--; // Closing parenthesis decreases nesting level
  }
  // INVARIANT: count >= 0 for valid expressions (can't close more groups than opened)
  return count;
}
