import { type ZodInfer, z } from "@/lib/utils/zod";

/**
 * Zod schema for validating unpause mutation inputs
 *
 * @property {string} address - The contract address
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} assettype - The type of asset
 */
export const UnpauseSchema = z.object({
  address: z.address(),
  pincode: z.pincode(),
  assettype: z.assetType(),
});

export type UnpauseInput = ZodInfer<typeof UnpauseSchema>;
