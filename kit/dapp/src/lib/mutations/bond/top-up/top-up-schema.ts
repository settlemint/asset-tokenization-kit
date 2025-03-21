import { type ZodInfer, z } from '@/lib/utils/zod';

/**
 * Zod schema for validating top up underlying asset mutation inputs
 *
 * @property {string} address - The bond contract address
 * @property {number} amount - The amount of underlying asset to top up
 * @property {string} underlyingAssetAddress - The address of the underlying asset contract
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} target - The target to top up ("bond" or "yield")
 * @property {string} yieldScheduleAddress - The address of the yield schedule contract (required if target is "yield")
 */
export const TopUpSchema = z.object({
  address: z.address(),
  underlyingAssetAddress: z.address(),
  underlyingAssetType: z.assetType(),
  yieldScheduleAddress: z.address().optional(),
  yieldUnderlyingAssetAddress: z.address().optional(),
  yieldUnderlyingAssetType: z.assetType().optional(),
  amount: z.amount(),
  pincode: z.pincode(),
  target: z.enum(["bond", "yield"]),
}).refine(
  (data) => data.target !== "yield" || data.yieldScheduleAddress,
  {
    message: "Yield schedule address is required when target is 'yield'",
    path: ["yieldScheduleAddress"]
  }
);

export type TopUpInput = ZodInfer<typeof TopUpSchema>;
