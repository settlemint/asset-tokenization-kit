import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { bigDecimal } from "@/lib/zod/validators/bigdecimal";
import { z } from "zod/v4";

/**
 * Schema for token balance information
 */
export const TokenBalanceSchema = z.object({
  id: ethereumAddress.describe("The address of the token holder"),
  available: bigDecimal().describe("Available balance amount"),
  frozen: bigDecimal().describe("Frozen balance amount"),
  isFrozen: z.boolean().describe("Whether the balance is frozen"),
  value: bigDecimal().describe("Total balance value"),
});

/**
 * Schema for token holder response
 */
export const TokenHoldersResponseSchema = z.object({
  token: z
    .object({
      balances: z
        .array(TokenBalanceSchema)
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

export type TokenBalance = z.infer<typeof TokenBalanceSchema>;
