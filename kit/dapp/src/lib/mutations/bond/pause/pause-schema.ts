import { z, type ZodInfer } from '@/lib/utils/zod';

/**
 * Zod schema for validating pause mutation inputs
 *
 * @property {string} address - The bond contract address
 * @property {string} pincode - The pincode for signing the transaction
 */
export const PauseSchema = z.object({
  address: z.address(),
  pincode: z.pincode(),
});

export type PauseInput = ZodInfer<typeof PauseSchema>;
