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
    default: {
      const _exhaustiveCheck: never = nodeType;
      throw new Error(`Unhandled expression type: ${_exhaustiveCheck}`);
    }
  }
}
