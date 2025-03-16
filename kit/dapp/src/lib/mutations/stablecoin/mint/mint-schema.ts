import { type ZodInfer, z } from '@/lib/utils/zod';

/**
 * Zod schema for validating mint mutation inputs
 *
 * @property {string} address - The stablecoin contract address
 * @property {number} amount - The amount of tokens to mint
 * @property {string} to - The recipient address
 * @property {string} pincode - User's pincode for authentication
 */
export const MintSchema = z.object({
  address: z.address(),
  amount: z.amount(),
  to: z.address(),
  pincode: z.pincode(),
});

export type MintInput = ZodInfer<typeof MintSchema>;
