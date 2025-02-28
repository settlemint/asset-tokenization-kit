import { z, type ZodInfer } from '@/lib/utils/zod';

/**
 * Zod schema for validating pause mutation inputs
 *
 * @property {string} address - The fund contract address
 * @property {string} pincode - User's pincode for authentication
 */
export const PauseSchema = z.object({
  address: z.address(),
  pincode: z.pincode(),
});

export type PauseInput = ZodInfer<typeof PauseSchema>;
