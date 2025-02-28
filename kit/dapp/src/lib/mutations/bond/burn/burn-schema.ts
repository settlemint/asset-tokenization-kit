import { z, type ZodInfer } from '@/lib/utils/zod';

/**
 * Zod schema for validating burn mutation inputs
 *
 * @property {string} address - The bond contract address
 * @property {number} amount - The amount of tokens to burn
 * @property {string} pincode - User's pincode for authentication
 */
export const BurnSchema = z.object({
  address: z.address(),
  amount: z.amount(),
  pincode: z.pincode(),
});

export type BurnInput = ZodInfer<typeof BurnSchema>;
