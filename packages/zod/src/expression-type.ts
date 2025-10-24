/**
 * Expression Type Validation Utilities
 *
 * Provides Zod schemas for validating ExpressionType enum values used in
 * logical expressions for compliance modules. Includes helper functions for
 * pretty names and constant node definitions.
 * Based on kit/contracts/scripts/hardhat/utils/expression-builder.ts
 * @module ExpressionTypeValidation
 */
import * as z from "zod";

/**
 * Tuple of valid expression type values for type-safe iteration.
 * Used to define the type of operation in expression nodes.
 * Values match ExpressionType from Solidity contracts.
 */
export const expressionTypes = [0, 1, 2, 3] as const;

/***
 * Tuple of valid expression type keys for type-safe iteration.
 * Used to define the type of operation in expression nodes.
 * Keys match ExpressionType from Solidity contracts.
 */
export const expressionTypeKeys = ["TOPIC", "AND", "OR", "NOT"] as const;

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
export const ExpressionTypeEnum: Record<ExpressionTypeKey, ExpressionType> = {
  TOPIC: 0,
  AND: 1,
  OR: 2,
  NOT: 3,
};

/**
 * Creates a Zod schema that validates an expression type key.
 * @returns A Zod schema that validates an expression type key.
 */
export const expressionTypeKey = () =>
  z.literal(expressionTypeKeys).describe("Expression type key identifier");

/**
 * Type representing a validated expression type key.
 */
export type ExpressionTypeKey = z.infer<ReturnType<typeof expressionTypeKey>>;

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
