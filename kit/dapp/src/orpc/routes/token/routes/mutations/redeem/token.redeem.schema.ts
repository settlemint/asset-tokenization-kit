import { BaseMutationOutputSchema } from "@/orpc/routes/common/schemas/mutation-output.schema";
import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { bigDecimal } from "@atk/zod/bigdecimal";
import { apiBigInt } from "@atk/zod/bigint";
import * as z from "zod";

export const TokenRedeemInputSchema = MutationInputSchemaWithContract.extend({
  amount: apiBigInt.describe("The amount of tokens to redeem").optional(),
  redeemAll: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to redeem all tokens (typically for bonds)"),
});

export const TokenRedeemAllInputSchema = MutationInputSchemaWithContract;

/**
 * Output schema for token redeem operation
 * Returns the ethereum hash and the updated token data
 */
export const TokenRedeemOutputSchema = BaseMutationOutputSchema.extend({
  data: z
    .object({
      amountRedeemed: bigDecimal().describe("Amount of tokens redeemed"),
      redeemedAll: z.boolean().describe("Whether all tokens were redeemed"),
      tokenName: z.string().optional().describe("Name of the token"),
      tokenSymbol: z.string().optional().describe("Symbol of the token"),
      totalRedeemedAmount: bigDecimal()
        .optional()
        .describe("Total amount redeemed from this token"),
    })
    .optional()
    .describe("Redeem operation details"),
});

export type TokenRedeemInput = z.infer<typeof TokenRedeemInputSchema>;
export type TokenRedeemAllInput = z.infer<typeof TokenRedeemAllInputSchema>;
export type TokenRedeemOutput = z.infer<typeof TokenRedeemOutputSchema>;
