import { assetBalance } from "@atk/zod/asset-balance";
import * as z from "zod";

/**
 * Schema for token holder response from TheGraph
 */
export const TokenHoldersGraphQLResponseSchema = z.object({
  token: z
    .object({
      balances: z
        .array(assetBalance())
        .describe("List of token balances ordered by last updated time"),
    })
    .nullable(),
});

/**
 * Schema for token holder response with total count
 */
export const TokenHoldersResponseSchema = z.object({
  token: z
    .object({
      balances: z
        .array(assetBalance())
        .describe("List of token balances ordered by last updated time"),
    })
    .nullable(),
  /** Total number of holders for pagination display */
  totalCount: z.number().int().nonnegative(),
});

/**
 * Input schema for token holders query
 */
export const TokenHoldersInputSchema = z.object({
  tokenAddress: z.string().describe("The token contract address"),
});
