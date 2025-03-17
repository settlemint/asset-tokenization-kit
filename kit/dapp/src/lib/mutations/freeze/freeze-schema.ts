import { type ZodInfer, z } from '@/lib/utils/zod';

/**
 * Zod schema for validating freeze account mutation inputs
 *
 * @property {string} address - The contract address
 * @property {string} userAddress - The address of the user to freeze
 * @property {number} amount - The amount to freeze
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} assettype - The type of asset
 */
export const FreezeSchema = z.object({
  address: z.address(),
  userAddress: z.address(),
  amount: z.amount(),
  pincode: z.pincode(),
  assettype: z.assetType(),
});

export type FreezeInput = ZodInfer<typeof FreezeSchema>;
