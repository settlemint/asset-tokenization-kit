import { type ZodInfer, z } from '@/lib/utils/zod';

/**
 * Zod schema for validating burn mutation inputs
 *
 * @property {string} address - The contract address
 * @property {number} amount - The amount of tokens to burn
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} assettype - The type of asset
 */
export const BurnSchema = z.object({
  address: z.address(),
  amount: z.amount(),
  pincode: z.pincode(),
  assettype: z.assetType(),
});

export type BurnInput = ZodInfer<typeof BurnSchema>;
