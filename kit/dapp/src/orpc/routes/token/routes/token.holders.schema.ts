import { assetBalance } from "@atk/zod/asset-balance";
import { z } from "zod";

/**
 * Schema for token holder response
 */
export const TokenHoldersResponseSchema = z.object({
  token: z
    .object({
      balances: z
        .array(assetBalance())
        .describe("List of token balances ordered by last updated time"),
    })
    .nullable(),
});

/**
 * Input schema for token holders query
 */
export const TokenHoldersInputSchema = z.object({
  tokenAddress: z.string().describe("The token contract address"),
});
