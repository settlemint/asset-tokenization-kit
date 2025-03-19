import { type ZodInfer, z } from "@/lib/utils/zod";

/**
 * Zod schema for validating unblock user mutation inputs
 *
 * @property {string} address - The contract address
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} userAddress - The address of the user to unblock
 * @property {string} assetType - The type of asset
 */
export const UnblockUserSchema = z.object({
  address: z.address(),
  pincode: z.pincode(),
  userAddress: z.address(),
  assettype: z.assetType(),
});

export type UnblockUserInput = ZodInfer<typeof UnblockUserSchema>;
