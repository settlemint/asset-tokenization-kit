import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { TransactionTrackingMessagesSchema } from "@/orpc/routes/common/schemas/transaction-messages.schema";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { apiBigInt } from "@/lib/zod/validators/bigint";
import { z } from "zod";

export const TokenApproveMessagesSchema =
  TransactionTrackingMessagesSchema.extend({
    preparingApproval: z
      .string()
      .optional()
      .default("Preparing to approve token allowance..."),
    submittingApproval: z
      .string()
      .optional()
      .default("Submitting approval transaction..."),
    approvalSuccessful: z
      .string()
      .optional()
      .default("Token allowance approved successfully"),
    approvalFailed: z
      .string()
      .optional()
      .default("Failed to approve token allowance"),
  });

export const TokenApproveInputSchema = MutationInputSchemaWithContract.extend({
  spender: ethereumAddress.describe("The address to approve as spender"),
  amount: apiBigInt.describe("The amount to approve for spending"),
  messages: TokenApproveMessagesSchema.optional(),
});

export type TokenApproveInput = z.infer<typeof TokenApproveInputSchema>;
export type TokenApproveMessages = z.infer<typeof TokenApproveMessagesSchema>;
