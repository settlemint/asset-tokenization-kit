import { TokenSupplyLimitParams } from "@atk/zod/src/compliance";
import { encodeAbiParameters, parseAbiParameters } from "viem";

export const encodeTokenSupplyLimitParams = (
  params: TokenSupplyLimitParams
): string => {
  return encodeAbiParameters(
    parseAbiParameters("(uint256,uint256,bool,bool,bool)"),
    [
      [
        BigInt(params.maxSupply),
        BigInt(params.periodLength),
        params.rolling,
        params.useBasePrice,
        params.global,
      ],
    ]
  );
};
