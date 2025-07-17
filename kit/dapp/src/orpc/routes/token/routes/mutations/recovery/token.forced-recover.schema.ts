import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { TransactionTrackingMessagesSchema } from "@/orpc/routes/common/schemas/transaction-messages.schema";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { z } from "zod";

export const TokenForcedRecoverMessagesSchema =
  TransactionTrackingMessagesSchema.extend({
    preparingForcedRecovery: z
      .string()
      .optional()
      .default("Preparing to force recover tokens..."),
    submittingForcedRecovery: z
      .string()
      .optional()
      .default("Submitting forced recovery transaction..."),
    forcedRecoverySuccessful: z
      .string()
      .optional()
      .default("Tokens force recovered successfully"),
    forcedRecoveryFailed: z
      .string()
      .optional()
      .default("Failed to force recover tokens"),
  });

export const TokenForcedRecoverInputSchema =
  MutationInputSchemaWithContract.extend({
    lostWallet: ethereumAddress.describe(
      "The address of the lost wallet to recover tokens from"
    ),
    newWallet: ethereumAddress.describe(
      "The address of the new wallet to recover tokens to"
    ),
    messages: TokenForcedRecoverMessagesSchema.optional(),
  });

export type TokenForcedRecoverInput = z.infer<
  typeof TokenForcedRecoverInputSchema
>;
export type TokenForcedRecoverMessages = z.infer<
  typeof TokenForcedRecoverMessagesSchema
>;
