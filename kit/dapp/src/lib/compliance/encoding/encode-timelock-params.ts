import type { TimeLockParams } from "@atk/zod/compliance";
import { convertInfixToPostfix } from "@atk/zod/expression-node";
import { encodeAbiParameters, parseAbiParameters } from "viem";

export const encodeTimeLockParams = (params: TimeLockParams): string => {
  const expression = convertInfixToPostfix(params.exemptionExpression) ?? [];
  return encodeAbiParameters(
    parseAbiParameters("(uint256,bool,(uint8,uint256)[])"),
    [
      [
        BigInt(params.holdPeriod),
        params.allowExemptions,
        expression.map((node) => [node.nodeType, node.value] as const),
      ],
    ]
  );
};
