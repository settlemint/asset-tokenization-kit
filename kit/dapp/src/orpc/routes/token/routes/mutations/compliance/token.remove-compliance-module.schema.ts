import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { TransactionTrackingMessagesSchema } from "@/orpc/routes/common/schemas/transaction-messages.schema";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { z } from "zod";

export const TokenRemoveComplianceModuleMessagesSchema =
  TransactionTrackingMessagesSchema.extend({
    preparingComplianceModuleRemoval: z
      .string()
      .optional()
      .default("Preparing to remove compliance module..."),
    submittingComplianceModuleRemoval: z
      .string()
      .optional()
      .default("Submitting compliance module removal transaction..."),
    complianceModuleRemovalSuccessful: z
      .string()
      .optional()
      .default("Compliance module removed successfully"),
    complianceModuleRemovalFailed: z
      .string()
      .optional()
      .default("Failed to remove compliance module"),
  });

export const TokenRemoveComplianceModuleInputSchema =
  MutationInputSchemaWithContract.extend({
    moduleAddress: ethereumAddress.describe(
      "The address of the compliance module to remove"
    ),
    messages: TokenRemoveComplianceModuleMessagesSchema.optional(),
  });

export type TokenRemoveComplianceModuleInput = z.infer<
  typeof TokenRemoveComplianceModuleInputSchema
>;
export type TokenRemoveComplianceModuleMessages = z.infer<
  typeof TokenRemoveComplianceModuleMessagesSchema
>;
