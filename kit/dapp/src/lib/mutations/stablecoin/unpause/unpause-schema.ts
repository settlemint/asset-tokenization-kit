import { z, type ZodInfer } from '@/lib/utils/zod';

/**
 * Zod schema for validating unpause mutation inputs
 *
 * @property {string} address - The stablecoin contract address
 * @property {string} pincode - The pincode for signing the transaction
 */
export const UnPauseSchema = z.object({
  address: z.address(),
  pincode: z.pincode(),
});

export type UnPauseInput = ZodInfer<typeof UnPauseSchema>;
