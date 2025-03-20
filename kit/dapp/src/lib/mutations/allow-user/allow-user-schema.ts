import { type ZodInfer, z } from "@/lib/utils/zod";

/**
 * Zod schema for validating allow user mutation inputs
 *
 * @property {string} address - The contract address
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} userAddress - The address of the user to allow
 * @property {string} assetType - The type of asset
 */
export const AllowUserSchema = z.object({
  address: z.address(),
  pincode: z.pincode(),
  userAddress: z.address(),
  assettype: z.assetType(),
});

export type AllowUserInput = ZodInfer<typeof AllowUserSchema>;
