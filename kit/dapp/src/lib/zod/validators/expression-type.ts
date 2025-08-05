/**
 * Expression Type Validation Utilities
 *
 * Provides Zod schemas for validating ExpressionType enum values used in
 * logical expressions for compliance modules. Includes helper functions for
 * pretty names and constant node definitions.
 * Based on kit/contracts/scripts/hardhat/utils/expression-builder.ts
 * @module ExpressionTypeValidation
 */
import { getTopicNameFromId } from "@/lib/zod/validators/topics";
import { z } from "zod";

/**
 * Tuple of valid expression type values for type-safe iteration.
 * Used to define the type of operation in expression nodes.
 * Values match ExpressionType from Solidity contracts.
 */
export const expressionTypes = [0, 1, 2, 3] as const;

/**
 * Enum-like object for dot notation access to expression type values.
 * Provides a convenient way to reference expression types in code.
 * @example
 * ```typescript
 * // Use for comparisons and assignments
 * if (nodeType === ExpressionTypeEnum.TOPIC) {
 *   console.log("Processing topic node");
 * }
 *
 * // Use in switch statements
 * switch (expressionType) {
 *   case ExpressionTypeEnum.AND:
 *     processAND();
 *     break;
 *   case ExpressionTypeEnum.OR:
 *     processOR();
 *     break;
 * }
 * ```
 */
export const ExpressionTypeEnum = {
  TOPIC: 0,
  AND: 1,
  OR: 2,
  NOT: 3,
} as const;

/**
 * Creates a Zod schema that validates an expression type.
 * @returns A Zod enum schema for expression type validation
 * @example
 * ```typescript
 * const schema = expressionType();
 * schema.parse(0); // Returns 0 as ExpressionType
 * schema.parse(99); // Throws ZodError
 *
 * // Use in form validation
 * const formSchema = z.object({
 *   nodeType: expressionType(),
 *   value: z.bigint()
 * });
 * ```
 */
export const expressionType = () =>
  z.literal(expressionTypes).describe("Expression type identifier");

/**
 * Type representing a validated expression type.
 */
export type ExpressionType = z.infer<ReturnType<typeof expressionType>>;

/**
 * Get a human-readable name for an expression type with optional topic context.
 * Uses exhaustive switch case to ensure all expression types are handled.
 * When the node type is TOPIC, optionally uses the topic name if value is provided.
 *
 * @param nodeType - The expression type to get a name for
 * @param topicValue - Optional topic ID value for TOPIC nodes
 * @returns Pretty name for the expression type
 *
 * @example
 * ```typescript
 * getPrettyName(ExpressionType.TOPIC); // "TOPIC"
 * getPrettyName(ExpressionType.TOPIC, 1n); // "KYC" (if topic ID 1 maps to KYC)
 * getPrettyName(ExpressionType.AND); // "AND"
 * getPrettyName(ExpressionType.OR); // "OR"
 * getPrettyName(ExpressionType.NOT); // "NOT"
 * ```
 */
export function getPrettyName(
  nodeType: ExpressionType,
  topicValue?: bigint
): string {
  // Exhaustive switch case ensures compile-time error if a node type is not covered
  switch (nodeType) {
    case ExpressionTypeEnum.TOPIC:
      if (topicValue !== undefined) {
        return getTopicNameFromId(topicValue);
      }
      return "TOPIC";
    case ExpressionTypeEnum.AND:
      return "AND";
    case ExpressionTypeEnum.OR:
      return "OR";
    case ExpressionTypeEnum.NOT:
      return "NOT";
    // TypeScript will error if we miss any enum values due to exhaustive checking
    default: {
      // This ensures we get a compile-time error for unhandled cases
      const _exhaustiveCheck: never = nodeType;
      throw new Error(`Unhandled expression type: ${_exhaustiveCheck}`);
    }
  }
}

/**
 * Get a symbol representation for an expression type.
 * Useful for compact display in UI components.
 *
 * @param nodeType - The expression type to get a symbol for
 * @returns Symbol representation of the expression type
 *
 * @example
 * ```typescript
 * getExpressionSymbol(ExpressionType.AND); // "∧"
 * getExpressionSymbol(ExpressionType.OR); // "∨"
 * getExpressionSymbol(ExpressionType.NOT); // "¬"
 * getExpressionSymbol(ExpressionType.TOPIC); // "◯"
 * ```
 */
export function getExpressionSymbol(nodeType: ExpressionType): string {
  switch (nodeType) {
    case ExpressionTypeEnum.TOPIC:
      return "◯";
    case ExpressionTypeEnum.AND:
      return "∧";
    case ExpressionTypeEnum.OR:
      return "v";
    case ExpressionTypeEnum.NOT:
      return "~";
    default: {
      const _exhaustiveCheck: never = nodeType;
      throw new Error(`Unhandled expression type: ${_exhaustiveCheck}`);
    }
  }
}

/**
 * Check if an expression type is a logical operator (AND, OR, NOT).
 *
 * @param nodeType - The expression type to check
 * @returns True if the node type is a logical operator
 *
 * @example
 * ```typescript
 * isLogicalOperator(ExpressionType.AND); // true
 * isLogicalOperator(ExpressionType.TOPIC); // false
 * ```
 */
export function isLogicalOperator(nodeType: ExpressionType): boolean {
  switch (nodeType) {
    case ExpressionTypeEnum.AND:
    case ExpressionTypeEnum.OR:
    case ExpressionTypeEnum.NOT:
      return true;
    case ExpressionTypeEnum.TOPIC:
      return false;
    default: {
      const _exhaustiveCheck: never = nodeType;
      throw new Error(`Unhandled expression type: ${_exhaustiveCheck}`);
    }
  }
}

/**
 * Check if an expression type is a binary operator (AND, OR).
 * Binary operators require two operands.
 *
 * @param nodeType - The expression type to check
 * @returns True if the node type is a binary operator
 *
 * @example
 * ```typescript
 * isBinaryOperator(ExpressionType.AND); // true
 * isBinaryOperator(ExpressionType.NOT); // false
 * ```
 */
export function isBinaryOperator(nodeType: ExpressionType): boolean {
  switch (nodeType) {
    case ExpressionTypeEnum.AND:
    case ExpressionTypeEnum.OR:
      return true;
    case ExpressionTypeEnum.NOT:
    case ExpressionTypeEnum.TOPIC:
      return false;
    default: {
      const _exhaustiveCheck: never = nodeType;
      throw new Error(`Unhandled expression type: ${_exhaustiveCheck}`);
    }
  }
}

/**
 * Check if an expression type is a unary operator (NOT).
 * Unary operators require one operand.
 *
 * @param nodeType - The expression type to check
 * @returns True if the node type is a unary operator
 *
 * @example
 * ```typescript
 * isUnaryOperator(ExpressionType.NOT); // true
 * isUnaryOperator(ExpressionType.AND); // false
 * ```
 */
export function isUnaryOperator(nodeType: ExpressionType): boolean {
  switch (nodeType) {
    case ExpressionTypeEnum.NOT:
      return true;
    case ExpressionTypeEnum.AND:
    case ExpressionTypeEnum.OR:
    case ExpressionTypeEnum.TOPIC:
      return false;
    default: {
      const _exhaustiveCheck: never = nodeType;
      throw new Error(`Unhandled expression type: ${_exhaustiveCheck}`);
    }
  }
}

/**
 * Get the number of operands required for an expression type.
 *
 * @param nodeType - The expression type to check
 * @returns Number of operands required (0 for TOPIC, 1 for NOT, 2 for AND/OR)
 *
 * @example
 * ```typescript
 * getOperandCount(ExpressionType.TOPIC); // 0
 * getOperandCount(ExpressionType.NOT); // 1
 * getOperandCount(ExpressionType.AND); // 2
 * ```
 */
export function getOperandCount(nodeType: ExpressionType): number {
  switch (nodeType) {
    case ExpressionTypeEnum.TOPIC:
      return 0;
    case ExpressionTypeEnum.NOT:
      return 1;
    case ExpressionTypeEnum.AND:
    case ExpressionTypeEnum.OR:
      return 2;
    default: {
      const _exhaustiveCheck: never = nodeType;
      throw new Error(`Unhandled expression type: ${_exhaustiveCheck}`);
    }
  }
}
