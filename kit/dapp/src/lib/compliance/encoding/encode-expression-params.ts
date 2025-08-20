import type { Expression, ExpressionNode } from "@atk/zod/expression-node";
import { encodeAbiParameters, parseAbiParameters } from "viem";

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
