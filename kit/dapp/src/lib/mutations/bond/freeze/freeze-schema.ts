import { z, type ZodInfer } from '@/lib/utils/zod';

/**
 * Zod schema for validating freeze mutation inputs
 *
 * @property {string} address - The bond contract address
 * @property {string} user - The address of the user to freeze tokens for
 * @property {number} amount - The amount of tokens to freeze
 * @property {string} pincode - User's pincode for authentication
 */
export const FreezeSchema = z.object({
  address: z.address(),
  user: z.address(),
  amount: z.amount(),
  pincode: z.pincode(),
});

export type FreezeInput = ZodInfer<typeof FreezeSchema>;
