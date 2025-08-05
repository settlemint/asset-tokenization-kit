import { ExpressionWithGroups } from "@/lib/zod/validators/expression-node";

/**
 * Validate UI expression by converting to postfix and using zod validation
 */
export function validateUIExpression(
  expression: ExpressionWithGroups
): boolean {
  if (expression.length === 0) return false;

  // TODO: return validateExpressionSyntax(expression);
  return true;
}

/**
 * Remove item at specific index from expression
 */
export function removeItemAtIndex(
  expression: ExpressionWithGroups,
  index: number
): ExpressionWithGroups {
  const newExpression = [...expression];
  newExpression.splice(index, 1);
  return newExpression;
}

/**
 * Check if we can add an end group (closing parenthesis)
 */
export function canAddEndGroup(expression: ExpressionWithGroups): boolean {
  let openGroups = 0;
  let hasValidLastItem = false;

  for (const item of expression) {
    if (item === "(") {
      openGroups++;
    } else if (item === ")") {
      openGroups--;
    } else if (typeof item === "object" && "nodeType" in item) {
      // This is an ExpressionNode - check if it's not an operator that needs more operands
      hasValidLastItem = true;
    }
  }

  return openGroups > 0 && hasValidLastItem && expression.length > 0;
}

/**
 * Get the count of open groups (unclosed parentheses)
 */
export function getOpenGroupCount(expression: ExpressionWithGroups): number {
  let count = 0;
  for (const item of expression) {
    if (item === "(") count++;
    else if (item === ")") count--;
  }
  return count;
}
