import { type ZodInfer, z } from '@/lib/utils/zod';

/**
 * Zod schema for validating update collateral mutation inputs
 *
 * @property {string} address - The contract address
 * @property {number} amount - The new collateral amount
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} assettype - The type of asset (only stablecoin or tokenizeddeposit)
 */
export const UpdateCollateralSchema = z.object({
  address: z.address(),
  amount: z.amount(),
  pincode: z.pincode(),
  assettype: z.assetType(),
});

export type UpdateCollateralInput = ZodInfer<typeof UpdateCollateralSchema>;
