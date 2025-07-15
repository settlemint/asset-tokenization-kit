import { getAssetTypeCapitalized } from "@/lib/utils/asset-capitalization";
import { assetType, type AssetType } from "@/lib/zod/validators/asset-types";
import { decimals } from "@/lib/zod/validators/decimals";
import { isin } from "@/lib/zod/validators/isin";
import { MutationInputSchema } from "@/orpc/routes/common/schemas/mutation.schema";
import { TransactionTrackingMessagesSchema } from "@/orpc/routes/common/schemas/transaction-messages.schema";
import { z } from "zod";

const ModulePairSchema = z.object({
  module: z.string(),
  params: z.string(),
});

/**
 * Base fields common to all token types
 */
export const TokenBaseSchema = MutationInputSchema.extend({
  name: z.string().describe("The name of the token"),
  symbol: z.string().describe("The symbol of the token"),
  decimals: decimals(),
  isin: isin().optional(),
  initialModulePairs: z.array(ModulePairSchema).optional().default([]),
  requiredClaimTopics: z.array(z.string()).optional().default([]),
  type: assetType(),
});

/**
 * Creates a messages schema for token creation based on the asset type
 * This reduces duplication by dynamically generating messages with the appropriate asset type name
 *
 * @param assetType - The type of asset being created (e.g., "deposit", "bond")
 * @returns A Zod schema with messages tailored to the specific asset type
 */
export function createTokenMessagesSchema(assetType: AssetType) {
  return TransactionTrackingMessagesSchema.extend({
    // Generic token creation messages
    creatingToken: z
      .string()
      .optional()
      .default(`Creating the ${assetType}...`),
    tokenCreated: z
      .string()
      .optional()
      .default(`${getAssetTypeCapitalized(assetType)} successfully created.`),
    tokenCreationFailed: z
      .string()
      .optional()
      .default(`Failed to create the ${assetType}.`),

    // Messages used by useStreamingMutation hook
    initialLoading: z
      .string()
      .optional()
      .default(`Preparing to create ${assetType}...`),
    noResultError: z
      .string()
      .optional()
      .default(`No transaction hash received from ${assetType} creation.`),
    defaultError: z
      .string()
      .optional()
      .default(`Failed to create the ${assetType}.`),
  });
}
