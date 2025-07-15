import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { TransactionTrackingMessagesSchema } from "@/orpc/routes/common/schemas/transaction-messages.schema";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { z } from "zod";

export const TokenAddComplianceModuleMessagesSchema =
  TransactionTrackingMessagesSchema.extend({
    preparingComplianceModule: z
      .string()
      .optional()
      .default("Preparing to add compliance module..."),
    submittingComplianceModule: z
      .string()
      .optional()
      .default("Submitting compliance module addition transaction..."),
    complianceModuleSuccessful: z
      .string()
      .optional()
      .default("Compliance module added successfully"),
    complianceModuleFailed: z
      .string()
      .optional()
      .default("Failed to add compliance module"),
  });

export const TokenAddComplianceModuleInputSchema =
  MutationInputSchemaWithContract.extend({
    moduleAddress: ethereumAddress.describe(
      "The address of the compliance module to add"
    ),
    messages: TokenAddComplianceModuleMessagesSchema.optional(),
  });

export type TokenAddComplianceModuleInput = z.infer<
  typeof TokenAddComplianceModuleInputSchema
>;
export type TokenAddComplianceModuleMessages = z.infer<
  typeof TokenAddComplianceModuleMessagesSchema
>;
