import { type ZodInfer, z } from '@/lib/utils/zod';

/**
 * Zod schema for validating top up underlying asset mutation inputs
 *
 * @property {string} address - The bond contract address
 * @property {number} amount - The amount of underlying asset to top up
 * @property {string} underlyingAssetAddress - The address of the underlying asset contract
 * @property {string} pincode - The pincode for signing the transaction
 */
export const TopUpSchema = z.object({
  address: z.address(),
  underlyingAssetAddress: z.address(),
  amount: z.amount(),
  pincode: z.pincode(),
});

export type TopUpInput = ZodInfer<typeof TopUpSchema>;
