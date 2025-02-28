import { z, type ZodInfer } from '@/lib/utils/zod';

/**
 * Zod schema for validating block user mutation inputs
 *
 * @property {string} address - The equity contract address
 * @property {string} user - The address of the user to block
 * @property {string} pincode - User's pincode for authentication
 */
export const BlockUserSchema = z.object({
  address: z.address(),
  user: z.address(),
  pincode: z.pincode(),
});

export type BlockUserInput = ZodInfer<typeof BlockUserSchema>;
