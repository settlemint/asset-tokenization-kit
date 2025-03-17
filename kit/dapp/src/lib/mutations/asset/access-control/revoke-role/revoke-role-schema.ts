import { type ZodInfer, z } from '@/lib/utils/zod';

/**
 * Zod schema for validating revoke role mutation inputs
 *
 * @property {string} address - The bond contract address
 * @property {Object} roles - Map of role names to boolean values indicating which roles to revoke
 * @property {string} userAddress - The address of the user to revoke roles from
 * @property {string} pincode - The pincode for signing the transaction
 */
export const RevokeRoleSchema = z.object({
  address: z.address(),
  roles: z.roles(),
  userAddress: z.address(),
  pincode: z.pincode(),
  assettype: z.assetType(),
});

export type RevokeRoleInput = ZodInfer<typeof RevokeRoleSchema>;
