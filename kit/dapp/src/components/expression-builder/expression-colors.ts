import {
  type ExpressionType,
  ExpressionTypeEnum,
} from "@atk/zod/expression-type";

/**
 * Centralized color configuration for expression builder components
 * Provides consistent styling across all expression type displays
 */
export const EXPRESSION_COLORS = {
  [ExpressionTypeEnum.TOPIC]: "bg-chart-1 hover:bg-chart-1/90",
  [ExpressionTypeEnum.AND]: "bg-chart-3 hover:bg-chart-3/90",
  [ExpressionTypeEnum.OR]: "bg-chart-4 hover:bg-chart-4/90",
  [ExpressionTypeEnum.NOT]: "bg-destructive hover:bg-destructive/90",
  PARENTHESES: "bg-secondary hover:bg-secondary/90",
} as const;

/**
 * Get color classes for an expression type
 * @param nodeType - The expression type
 * @returns Tailwind CSS classes for the expression type
 */
export function getExpressionColor(nodeType: ExpressionType) {
  return EXPRESSION_COLORS[nodeType] ?? EXPRESSION_COLORS.PARENTHESES;
}

/**
 * Get color classes for parentheses
 * @returns Tailwind CSS classes for parentheses
 */
export function getParenthesesColor() {
  return EXPRESSION_COLORS.PARENTHESES;
}
