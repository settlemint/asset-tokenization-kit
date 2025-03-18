import { type ZodInfer, z } from "@/lib/utils/zod";

/**
 * Zod schema for validating block user mutation inputs
 *
 * @property {string} address - The contract address
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} account - The account to block
 * @property {string} assetType - The type of asset
 */
export const BlockUserSchema = z.object({
  address: z.address(),
  pincode: z.pincode(),
  user: z.address(),
  assettype: z.assetType(),
});

export type BlockUserInput = ZodInfer<typeof BlockUserSchema>;
