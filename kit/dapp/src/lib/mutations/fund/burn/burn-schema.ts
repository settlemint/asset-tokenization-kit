import { z, type ZodInfer } from '@/lib/utils/zod';

/**
 * Zod schema for validating burn mutation inputs
 *
 * @property {string} address - The fund contract address
 * @property {number} amount - The amount of tokens to burn
 * @property {string} pincode - The pincode for signing the transaction
 */
export const BurnSchema = z.object({
  address: z.address(),
  amount: z.amount(),
  pincode: z.pincode(),
});

export type BurnInput = ZodInfer<typeof BurnSchema>;
