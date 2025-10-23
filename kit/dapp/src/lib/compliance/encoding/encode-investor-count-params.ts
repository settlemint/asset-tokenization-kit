import type { InvestorCountParams } from "@atk/zod/compliance";
import { convertInfixToPostfix } from "@atk/zod/expression-node";
import { encodeAbiParameters, parseAbiParameters } from "viem";

export const encodeInvestorCountParams = (
  params: InvestorCountParams
): string => {
  const expression = convertInfixToPostfix(params.topicFilter) ?? [];
  return encodeAbiParameters(
    parseAbiParameters("(uint256,bool,uint16[],uint256[],(uint8,uint256)[])"),
    [
      [
        BigInt(params.maxInvestors),
        params.global,
        params.countryCodes,
        params.countryLimits.map(BigInt),
        expression.map((node) => [node.nodeType, node.value] as const),
      ],
    ]
  );
};
