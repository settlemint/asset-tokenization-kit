import type { TokenSupplyLimitParams } from "@atk/zod/compliance";
import { encodeAbiParameters, parseAbiParameters } from "viem";

export const encodeTokenSupplyLimitParams = (
  params: TokenSupplyLimitParams
): string => {
  return encodeAbiParameters(
    parseAbiParameters("(uint256,uint256,bool,bool,bool)"),
    [
      [
        params.maxSupply,
        BigInt(params.periodLength),
        params.rolling,
        params.useBasePrice,
        params.global,
      ],
    ]
  );
};
