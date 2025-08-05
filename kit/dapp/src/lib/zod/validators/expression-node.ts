/**
 * Expression Node Validation Utilities
 *
 * Provides Zod schemas for validating ExpressionNode objects used in
 * logical expressions for compliance modules. Includes conditional validation
 * based on node type and comprehensive helper functions.
 * Based on kit/contracts/scripts/hardhat/utils/expression-builder.ts
 * @module ExpressionNodeValidation
 */
import { getTopicId, type ATKTopic } from "@/lib/zod/validators/topics";
import z from "zod";
import {
  expressionType,
  ExpressionTypeEnum,
  getPrettyName,
} from "./expression-type";

export const expressionNode = z.object({
  nodeType: expressionType(),
  value: z.bigint(),
});

export type ExpressionNode = z.infer<typeof expressionNode>;

/**
 * Create a TOPIC expression node from various input types.
 *
 * @param topic - ATK topic enum
 * @returns Validated ExpressionNode with TOPIC type
 *
 * @example
 * ```typescript
 * createTopicExpressionNode(ATKTopic.kyc); // { nodeType: ExpressionType.TOPIC, value: 1n }
 * ```
 */
export function createTopicExpressionNode(topic: ATKTopic): ExpressionNode {
  return {
    nodeType: ExpressionTypeEnum.TOPIC,
    value: getTopicId(topic),
  };
}

/**
 * Create an AND operator expression node.
 *
 * @returns ExpressionNode with AND type and value 0
 *
 * @example
 * ```typescript
 * createAndExpressionNode(); // { nodeType: ExpressionType.AND, value: 0n }
 * ```
 */
export function createAndExpressionNode(): ExpressionNode {
  return {
    nodeType: ExpressionTypeEnum.AND,
    value: 0n,
  };
}

/**
 * Create an OR operator expression node.
 *
 * @returns ExpressionNode with OR type and value 0
 *
 * @example
 * ```typescript
 * createOrExpressionNode(); // { nodeType: ExpressionType.OR, value: 0n }
 * ```
 */
export function createOrExpressionNode(): ExpressionNode {
  return {
    nodeType: ExpressionTypeEnum.OR,
    value: 0n,
  };
}

/**
 * Create a NOT operator expression node.
 *
 * @returns ExpressionNode with NOT type and value 0
 *
 * @example
 * ```typescript
 * createNotExpressionNode(); // { nodeType: ExpressionType.NOT, value: 0n }
 * ```
 */
export function createNotExpressionNode(): ExpressionNode {
  return {
    nodeType: ExpressionTypeEnum.NOT,
    value: 0n,
  };
}

/**
 * Convert an expression node to a human-readable string.
 * Uses the pretty name functionality from expression-type module.
 *
 * @param node - Expression node to convert
 * @returns Human-readable string representation
 *
 * @example
 * ```typescript
 * const topicNode = { nodeType: ExpressionType.TOPIC, value: 1n };
 * expressionNodeToString(topicNode); // "KYC" (if topic ID 1 maps to KYC)
 *
 * const andNode = { nodeType: ExpressionType.AND, value: 0n };
 * expressionNodeToString(andNode); // "AND"
 * ```
 */
export function expressionNodeToString(node: ExpressionNode): string {
  if (node.nodeType === ExpressionTypeEnum.TOPIC) {
    return getPrettyName(node.nodeType, node.value);
  }
  return getPrettyName(node.nodeType);
}

/**
 * Validate that an expression array represents a well-formed postfix expression.
 * Checks that the expression can be evaluated without stack underflow/overflow.
 *
 * @param nodes - Array of expression nodes to validate
 * @returns True if the expression is well-formed
 *
 * @example
 * ```typescript
 * // Valid: KYC AND AML
 * validateExpressionSyntax([
 *   { nodeType: ExpressionType.TOPIC, value: 1n },
 *   { nodeType: ExpressionType.TOPIC, value: 2n },
 *   { nodeType: ExpressionType.AND, value: 0n }
 * ]); // true
 *
 * // Invalid: Missing operand
 * validateExpressionSyntax([
 *   { nodeType: ExpressionType.TOPIC, value: 1n },
 *   { nodeType: ExpressionType.AND, value: 0n }
 * ]); // false
 * ```
 */
export function validateExpressionSyntax(nodes: ExpressionNode[]): boolean {
  if (nodes.length === 0) {
    return false;
  }

  let stackSize = 0;

  for (const node of nodes) {
    switch (node.nodeType) {
      case ExpressionTypeEnum.TOPIC:
        // Topics add one operand to the stack
        stackSize++;
        break;
      case ExpressionTypeEnum.AND:
      case ExpressionTypeEnum.OR:
        // Binary operators require 2 operands and produce 1 result
        if (stackSize < 2) {
          return false; // Stack underflow
        }
        stackSize = stackSize - 2 + 1; // Remove 2, add 1
        break;
      case ExpressionTypeEnum.NOT:
        // Unary operator requires 1 operand and produces 1 result
        if (stackSize < 1) {
          return false; // Stack underflow
        }
        // stackSize remains the same (remove 1, add 1)
        break;
      default:
        return false; // Unknown node type
    }
  }

  // Valid expression should have exactly 1 result on the stack
  return stackSize === 1;
}

/**
 * Convert an expression array to a human-readable infix string representation.
 * Mirrors the expressionToString function from the contracts expression builder.
 *
 * @param nodes - Array of expression nodes in postfix notation
 * @returns String representation in infix notation
 *
 * @example
 * ```typescript
 * const expression = [
 *   { nodeType: ExpressionType.TOPIC, value: 1n },
 *   { nodeType: ExpressionType.TOPIC, value: 2n },
 *   { nodeType: ExpressionType.AND, value: 0n }
 * ];
 * expressionArrayToString(expression); // "(KYC AND AML)"
 * ```
 */
export function expressionArrayToString(nodes: ExpressionNode[]): string {
  if (nodes.length === 0) {
    return "EMPTY";
  }

  const stack: string[] = [];

  for (const node of nodes) {
    switch (node.nodeType) {
      case ExpressionTypeEnum.TOPIC:
        stack.push(expressionNodeToString(node));
        break;
      case ExpressionTypeEnum.AND:
        if (stack.length < 2) {
          throw new Error("Invalid expression: AND requires two operands");
        }
        {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const rightAnd = stack.pop()!;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const leftAnd = stack.pop()!;
          stack.push(`(${leftAnd} AND ${rightAnd})`);
          break;
        }
      case ExpressionTypeEnum.OR: {
        if (stack.length < 2) {
          throw new Error("Invalid expression: OR requires two operands");
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const rightOr = stack.pop()!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const leftOr = stack.pop()!;
        stack.push(`(${leftOr} OR ${rightOr})`);
        break;
      }
      case ExpressionTypeEnum.NOT: {
        if (stack.length === 0) {
          throw new Error("Invalid expression: NOT requires one operand");
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const operand = stack.pop()!;
        stack.push(`NOT ${operand}`);
        break;
      }
      default:
        throw new Error(`Unknown expression node type: ${node.nodeType}`);
    }
  }

  if (stack.length !== 1) {
    throw new Error("Invalid expression: must evaluate to exactly one result");
  }

  return stack[0] || "EMPTY";
}
