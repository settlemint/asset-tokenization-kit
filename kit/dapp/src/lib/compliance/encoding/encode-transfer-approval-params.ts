import type { TransferApprovalParams } from "@atk/zod/compliance";
import { convertInfixToPostfix } from "@atk/zod/expression-node";
import { encodeAbiParameters, parseAbiParameters } from "viem";

export const encodeTransferApprovalParams = (
  params: TransferApprovalParams
): string => {
  const expression = convertInfixToPostfix(params.exemptionExpression) ?? [];
  return encodeAbiParameters(
    parseAbiParameters("(address[],bool,bool,(uint8,uint256)[],uint256)"),
    [
      [
        params.approvalAuthorities,
        params.allowExemptions,
        params.oneTimeUse,
        expression.map((node) => [node.nodeType, node.value] as const),
        BigInt(params.approvalExpiry),
      ],
    ]
  );
};
