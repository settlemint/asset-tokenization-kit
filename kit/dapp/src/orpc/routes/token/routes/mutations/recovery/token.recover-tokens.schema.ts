import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { TransactionTrackingMessagesSchema } from "@/orpc/routes/common/schemas/transaction-messages.schema";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { z } from "zod";

export const TokenRecoverTokensMessagesSchema =
  TransactionTrackingMessagesSchema.extend({
    preparingRecovery: z
      .string()
      .optional()
      .default("Preparing to recover tokens..."),
    submittingRecovery: z
      .string()
      .optional()
      .default("Submitting token recovery transaction..."),
    recoverySuccessful: z
      .string()
      .optional()
      .default("Tokens recovered successfully"),
    recoveryFailed: z.string().optional().default("Failed to recover tokens"),
  });

export const TokenRecoverTokensInputSchema =
  MutationInputSchemaWithContract.extend({
    lostWallet: ethereumAddress.describe(
      "The address of the lost wallet to recover tokens from"
    ),
    messages: TokenRecoverTokensMessagesSchema.optional(),
  });

export type TokenRecoverTokensInput = z.infer<
  typeof TokenRecoverTokensInputSchema
>;
export type TokenRecoverTokensMessages = z.infer<
  typeof TokenRecoverTokensMessagesSchema
>;
