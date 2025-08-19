import {
  ExpressionWithGroups,
  validateExpressionWithGroups,
} from "@/lib/zod/validators/expression-node";

/**
 * Validate UI expression by converting to postfix and using expression validation
 */
export function validateUIExpression(
  expression: ExpressionWithGroups
): boolean {
  if (expression.length === 0) return false;

  return validateExpressionWithGroups(expression);
}

/**
 * Remove item at specific index from expression
 */
export function removeItemAtIndex(
  expression: ExpressionWithGroups,
  index: number | number[]
): ExpressionWithGroups {
  if (typeof index === "number") {
    const newExpression = [...expression];
    newExpression.splice(index, 1);

    return newExpression;
  }

  const newExpression: ExpressionWithGroups = [];
  for (const [currentIndex, item] of expression.entries()) {
    if (index.includes(currentIndex)) {
      continue;
    }
    newExpression.push(item);
  }
  return newExpression;
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
