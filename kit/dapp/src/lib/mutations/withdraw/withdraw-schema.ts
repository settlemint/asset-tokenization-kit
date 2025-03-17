import { type ZodInfer, z } from "@/lib/utils/zod";

/**
 * Zod schema for validating withdraw underlying asset mutation inputs
 *
 * @property {string} address - The contract address
 * @property {string} to - The recipient address
 * @property {number} amount - The amount of underlying asset to withdraw
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} underlyingAssetAddress - The address of the underlying asset
 * @property {string} assettype - The type of asset
 */
export const WithdrawSchema = z.object({
  address: z.address(),
  to: z.address(),
  amount: z.amount(),
  underlyingAssetAddress: z.address(),
  pincode: z.pincode(),
  assettype: z.assetType(),
});

export type WithdrawInput = ZodInfer<typeof WithdrawSchema>;
