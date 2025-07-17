import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { TransactionTrackingMessagesSchema } from "@/orpc/routes/common/schemas/transaction-messages.schema";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { z } from "zod";

export const TokenFreezeAddressMessagesSchema =
  TransactionTrackingMessagesSchema.extend({
    preparingFreeze: z
      .string()
      .optional()
      .default("Preparing to freeze address..."),
    submittingFreeze: z
      .string()
      .optional()
      .default("Submitting freeze transaction..."),
    freezeSuccessful: z
      .string()
      .optional()
      .default("Address frozen successfully"),
    freezeFailed: z.string().optional().default("Failed to freeze address"),
  });

export const TokenFreezeAddressInputSchema =
  MutationInputSchemaWithContract.extend({
    userAddress: ethereumAddress.describe("The address to freeze or unfreeze"),
    freeze: z
      .boolean()
      .describe("Whether to freeze (true) or unfreeze (false) the address"),
    messages: TokenFreezeAddressMessagesSchema.optional(),
  });

export type TokenFreezeAddressInput = z.infer<
  typeof TokenFreezeAddressInputSchema
>;
export type TokenFreezeAddressMessages = z.infer<
  typeof TokenFreezeAddressMessagesSchema
>;
