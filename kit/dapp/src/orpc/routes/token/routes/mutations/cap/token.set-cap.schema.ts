import { apiBigInt } from "@/lib/zod/validators/bigint";
import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { TransactionTrackingMessagesSchema } from "@/orpc/routes/common/schemas/transaction-messages.schema";
import { z } from "zod";

export const TokenSetCapMessagesSchema =
  TransactionTrackingMessagesSchema.extend({
    preparingCapUpdate: z
      .string()
      .optional()
      .default("Preparing to update token cap..."),
    submittingCapUpdate: z
      .string()
      .optional()
      .default("Submitting cap update transaction..."),
    capUpdateSuccessful: z
      .string()
      .optional()
      .default("Token cap updated successfully"),
    capUpdateFailed: z
      .string()
      .optional()
      .default("Failed to update token cap"),
  });

export const TokenSetCapInputSchema = MutationInputSchemaWithContract.extend({
  newCap: apiBigInt.describe("The new cap amount for the token"),
  messages: TokenSetCapMessagesSchema.optional(),
});

export type TokenSetCapInput = z.infer<typeof TokenSetCapInputSchema>;
export type TokenSetCapMessages = z.infer<typeof TokenSetCapMessagesSchema>;
