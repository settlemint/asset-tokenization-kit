import { type ZodInfer, z } from '@/lib/utils/zod';

/**
 * Zod schema for validating update collateral mutation inputs
 *
 * @property {string} address - The stablecoin contract address
 * @property {number} amount - The new collateral amount
 * @property {string} pincode - The pincode for signing the transaction
 */
export const UpdateCollateralSchema = z.object({
  address: z.address(),
  amount: z.amount(),
  pincode: z.pincode(),
});

export type UpdateCollateralInput = ZodInfer<typeof UpdateCollateralSchema>;
