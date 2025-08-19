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
import { expressionType, ExpressionTypeEnum } from "./expression-type";

export const expressionNode = z.object({
  nodeType: expressionType(),
  value: z.bigint(),
});

export type ExpressionNode = z.infer<typeof expressionNode>;

export const expression = z.array(expressionNode);

export type Expression = z.infer<typeof expression>;

export const expressionNodeWithGroups = z.union([
  expressionNode,
  z.literal("(" as const),
  z.literal(")" as const),
]);

export type ExpressionNodeWithGroups = z.infer<typeof expressionNodeWithGroups>;

export const expressionWithGroups = z.array(expressionNodeWithGroups);

export type ExpressionWithGroups = z.infer<typeof expressionWithGroups>;

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
 * Validate that an expression array with grouping represents a well-formed expression.
 * Handles parentheses for grouping and validates the logical structure.
 *
 * @param nodes - Array of expression nodes with optional grouping parentheses
 * @returns True if the expression is well-formed
 *
 * @example
 * ```typescript
 * // Valid: (KYC AND AML) OR COLLATERAL
 * validateExpressionWithGroups([
 *   "(",
 *   { nodeType: ExpressionType.TOPIC, value: 1n }, // KYC
 *   { nodeType: ExpressionType.TOPIC, value: 2n }, // AML
 *   { nodeType: ExpressionType.AND, value: 0n },
 *   ")",
 *   { nodeType: ExpressionType.TOPIC, value: 3n }, // COLLATERAL
 *   { nodeType: ExpressionType.OR, value: 0n }
 * ]); // true
 *
 * // Invalid: Unmatched parentheses
 * validateExpressionWithGroups([
 *   "(",
 *   { nodeType: ExpressionType.TOPIC, value: 1n },
 *   { nodeType: ExpressionType.TOPIC, value: 2n },
 *   { nodeType: ExpressionType.AND, value: 0n }
 * ]); // false - missing closing parenthesis
 * ```
 */
export function validateExpressionWithGroups(
  nodes: ExpressionWithGroups
): boolean {
  if (nodes.length === 0) {
    return false;
  }

  // First, check for balanced parentheses
  let parenCount = 0;
  for (const node of nodes) {
    if (node === "(") {
      parenCount++;
    } else if (node === ")") {
      parenCount--;
      if (parenCount < 0) {
        return false; // Closing parenthesis without matching opening
      }
    }
  }

  if (parenCount !== 0) {
    return false; // Unmatched parentheses
  }

  // Convert infix expression with groups to postfix for validation
  const postfixNodes = convertInfixToPostfix(nodes);

  // If conversion failed, expression is invalid
  if (postfixNodes === null) {
    return false;
  }

  // Validate the postfix expression
  return validateExpressionSyntax(postfixNodes);
}

/**
 * Convert infix expression with groups to postfix notation for validation.
 * Uses the Shunting Yard algorithm to handle operator precedence and parentheses.
 *
 * @param nodes - Infix expression with grouping
 * @returns Postfix expression array or null if invalid
 */
export function convertInfixToPostfix(
  nodes: ExpressionWithGroups
): ExpressionNode[] | null {
  const output: ExpressionNode[] = [];
  const operatorStack: (ExpressionNode | "(")[] = [];

  // Operator precedence (higher number = higher precedence)
  const getPrecedence = (nodeType: number): number => {
    switch (nodeType) {
      case ExpressionTypeEnum.NOT:
        return 3; // Highest precedence
      case ExpressionTypeEnum.AND:
        return 2;
      case ExpressionTypeEnum.OR:
        return 1; // Lowest precedence
      default:
        return 0;
    }
  };

  for (const node of nodes) {
    if (typeof node === "string") {
      if (node === "(") {
        operatorStack.push("(");
      } else if (node === ")") {
        // Pop operators until we find the matching opening parenthesis
        while (operatorStack.length > 0) {
          const top = operatorStack.pop();
          if (top === "(") {
            break;
          }
          if (top && typeof top === "object") {
            output.push(top);
          }
        }
      }
    } else {
      // ExpressionNode
      if (node.nodeType === ExpressionTypeEnum.TOPIC) {
        // Operands go directly to output
        output.push(node);
      } else {
        // Operators need precedence handling
        const currentPrecedence = getPrecedence(node.nodeType);

        // Pop operators with higher or equal precedence
        while (
          operatorStack.length > 0 &&
          operatorStack.at(-1) !== "(" &&
          typeof operatorStack.at(-1) === "object"
        ) {
          const topOp = operatorStack.at(-1) as ExpressionNode;
          const topPrecedence = getPrecedence(topOp.nodeType);

          if (topPrecedence >= currentPrecedence) {
            output.push(operatorStack.pop() as ExpressionNode);
          } else {
            break;
          }
        }

        operatorStack.push(node);
      }
    }
  }

  // Pop remaining operators
  while (operatorStack.length > 0) {
    const top = operatorStack.pop();
    if (top === "(") {
      return null; // Unmatched opening parenthesis
    }
    if (top && typeof top === "object") {
      output.push(top);
    }
  }

  return output;
}

/**
 * Convert postfix expression back to infix notation with groups for UI editing.
 * This is a simplified conversion that may not preserve original grouping exactly.
 *
 * @param postfixNodes - Postfix expression array
 * @returns Infix expression with groups or empty array if invalid
 */
export function convertPostfixToInfix(
  postfixNodes: ExpressionNode[]
): ExpressionWithGroups {
  if (postfixNodes.length === 0) {
    return [];
  }

  // For simple cases, we can convert back to infix
  // For complex cases with multiple operators, we'll add minimal grouping
  const stack: ExpressionWithGroups[] = [];

  for (const node of postfixNodes) {
    switch (node.nodeType) {
      case ExpressionTypeEnum.TOPIC:
        // Operands go on the stack as single-element arrays
        stack.push([node]);

        break;

      case ExpressionTypeEnum.NOT: {
        // Unary operator
        if (stack.length === 0) {
          return []; // Invalid expression
        }
        const operand = stack.pop();
        if (!operand) {
          return []; // Invalid expression
        }
        // Add NOT after the operand: [operand, NOT]
        stack.push([...operand, node]);

        break;
      }
      case ExpressionTypeEnum.AND:
      case ExpressionTypeEnum.OR: {
        // Binary operators
        if (stack.length < 2) {
          return []; // Invalid expression
        }
        const right = stack.pop();
        const left = stack.pop();
        if (!right || !left) {
          return []; // Invalid expression
        }

        // For binary operators, create: [left, right, operator]
        // Add parentheses if either operand is complex (more than one element)
        const result: ExpressionWithGroups = [];

        if (left.length > 1) {
          result.push("(", ...left, ")");
        } else {
          result.push(...left);
        }

        if (right.length > 1) {
          result.push("(", ...right, ")");
        } else {
          result.push(...right);
        }

        result.push(node);
        stack.push(result);

        break;
      }
      // No default
    }
  }

  if (stack.length !== 1) {
    return []; // Invalid expression
  }

  return stack[0] as ExpressionWithGroups;
}
