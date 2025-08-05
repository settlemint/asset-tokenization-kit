import {
  convertPostfixToInfix,
  ExpressionNode,
  type Expression,
} from "@/lib/zod/validators/expression-node";
import type { ExpressionType } from "@/lib/zod/validators/expression-type";
import {
  decodeAbiParameters,
  encodeAbiParameters,
  parseAbiParameters,
} from "viem";

/**
 * Encodes expression parameters for identity restriction modules
 * @param expression Postfix expression array
 * @returns Encoded ABI parameters as hex string, or empty string if invalid
 */
export const encodeExpressionParams = (expression: Expression): string => {
  return encodeAbiParameters(parseAbiParameters("(uint8,uint256)[]"), [
    expression.map(
      (node: ExpressionNode) => [node.nodeType as number, node.value] as const
    ),
  ]);
};

/**
 * Decodes expression parameters back to ExpressionWithGroups
 * @param encodedParams Encoded ABI parameters as hex string
 * @returns ExpressionWithGroups array, or empty array if invalid
 */
export const decodeExpressionParams = (encodedParams: string) => {
  try {
    if (!encodedParams) return [];

    const [decodedArray] = decodeAbiParameters(
      parseAbiParameters("(uint8,uint256)[]"),
      encodedParams as `0x${string}`
    );

    const postfixExpression: Expression = decodedArray.map(
      ([nodeType, value]) => ({
        nodeType: nodeType as ExpressionType,
        value: value,
      })
    );

    // Convert postfix back to infix with groups for UI editing
    return convertPostfixToInfix(postfixExpression);
  } catch {
    return [];
  }
};
