import { z, type ZodInfer } from '@/lib/utils/zod';

/**
 * Zod schema for validating update roles mutation inputs
 *
 * @property {string} address - The cryptocurrency contract address
 * @property {Object} roles - Map of role names to boolean values indicating which roles to grant/revoke
 * @property {string} account - The account to update roles for
 * @property {string} pincode - User's pincode for authentication
 */
export const UpdateRolesSchema = z.object({
  address: z.address(),
  roles: z.roles(),
  account: z.address(),
  pincode: z.pincode(),
});

export type UpdateRolesInput = ZodInfer<typeof UpdateRolesSchema>;
