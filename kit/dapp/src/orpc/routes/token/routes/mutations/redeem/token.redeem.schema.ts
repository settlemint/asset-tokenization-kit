import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { TransactionTrackingMessagesSchema } from "@/orpc/routes/common/schemas/transaction-messages.schema";
import { apiBigInt } from "@/lib/zod/validators/bigint";
import { z } from "zod";

export const TokenRedeemMessagesSchema =
  TransactionTrackingMessagesSchema.extend({
    preparingRedemption: z
      .string()
      .optional()
      .default("Preparing to redeem tokens..."),
    submittingRedemption: z
      .string()
      .optional()
      .default("Submitting redemption transaction..."),
    redemptionSuccessful: z
      .string()
      .optional()
      .default("Tokens redeemed successfully"),
    redemptionFailed: z.string().optional().default("Failed to redeem tokens"),
  });

export const TokenRedeemInputSchema = MutationInputSchemaWithContract.extend({
  amount: apiBigInt.describe("The amount of tokens to redeem").optional(),
  redeemAll: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to redeem all tokens (typically for bonds)"),
  messages: TokenRedeemMessagesSchema.optional(),
});

export const TokenRedeemAllInputSchema = MutationInputSchemaWithContract.extend(
  {
    messages: TokenRedeemMessagesSchema.optional(),
  }
);

export type TokenRedeemInput = z.infer<typeof TokenRedeemInputSchema>;
export type TokenRedeemAllInput = z.infer<typeof TokenRedeemAllInputSchema>;
export type TokenRedeemMessages = z.infer<typeof TokenRedeemMessagesSchema>;
