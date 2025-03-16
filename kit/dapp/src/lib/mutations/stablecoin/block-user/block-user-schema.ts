import { type ZodInfer, z } from '@/lib/utils/zod';

/**
 * Zod schema for validating block user mutation inputs
 *
 * @property {string} address - The stablecoin contract address
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} account - The account to block
 */
export const BlockUserSchema = z.object({
  address: z.address(),
  pincode: z.pincode(),
  account: z.address(),
});

export type BlockUserInput = ZodInfer<typeof BlockUserSchema>;
