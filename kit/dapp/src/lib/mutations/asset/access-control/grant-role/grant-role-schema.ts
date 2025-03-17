import { type ZodInfer, z } from '@/lib/utils/zod';

/**
 * Zod schema for validating grant role mutation inputs
 *
 * @property {string} address - The stablecoin contract address
 * @property {Object} roles - Map of role names to boolean values indicating which roles to grant
 * @property {string} userAddress - The address of the user to grant roles to
 * @property {string} pincode - The pincode for signing the transaction
 */
export const GrantRoleSchema = z.object({
  address: z.address(),
  roles: z.roles(),
  userAddress: z.address(),
  pincode: z.pincode(),
  assettype: z.assetType(),
});

export type GrantRoleInput = ZodInfer<typeof GrantRoleSchema>;
