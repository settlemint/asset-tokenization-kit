import { z, type ZodInfer } from '@/lib/utils/zod';

/**
 * Zod schema for validating unpause mutation inputs
 *
 * @property {string} address - The bond contract address
 * @property {string} pincode - User's pincode for authentication
 */
export const UnpauseSchema = z.object({
  address: z.address(),
  pincode: z.pincode(),
});

export type UnpauseInput = ZodInfer<typeof UnpauseSchema>;
