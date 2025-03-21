import { type ZodInfer, z } from "@/lib/utils/zod";

/**
 * Zod schema for validating withdraw underlying asset mutation inputs
 *
 * @property {string} address - The bond contract address
 * @property {string} to - The recipient address
 * @property {number} amount - The amount of underlying asset to withdraw
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} underlyingAssetAddress - The address of the underlying asset contract
 * @property {string} underlyingAssetType - The type of underlying asset
 * @property {string} target - The target to withdraw from ("bond" or "yield")
 * @property {string} yieldScheduleAddress - The address of the yield schedule contract (required if target is "yield")
 * @property {string} yieldUnderlyingAssetAddress - The address of the yield underlying asset contract (required if target is "yield")
 * @property {string} yieldUnderlyingAssetType - The type of yield underlying asset (required if target is "yield")
 * @property {string} assettype - [DEPRECATED] The type of asset (for backward compatibility)
 */
export const WithdrawSchema = z.object({
  address: z.address(),
  to: z.address(),
  amount: z.amount(),
  underlyingAssetAddress: z.address(),
  underlyingAssetType: z.assetType().optional(),
  yieldScheduleAddress: z.address().optional(),
  yieldUnderlyingAssetAddress: z.address().optional(),
  yieldUnderlyingAssetType: z.assetType().optional(),
  pincode: z.pincode(),
  target: z.enum(["bond", "yield"]).optional(),
  assettype: z.assetType().optional(),
}).refine(
  (data) => {
    if (data.assettype && !data.target) {
      return true;
    }
    return data.target !== "yield" || data.yieldScheduleAddress;
  },
  {
    message: "Yield schedule address is required when target is 'yield'",
    path: ["yieldScheduleAddress"]
  }
);

export type WithdrawInput = ZodInfer<typeof WithdrawSchema>;
