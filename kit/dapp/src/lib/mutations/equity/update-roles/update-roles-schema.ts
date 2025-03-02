import { z, type ZodInfer } from '@/lib/utils/zod';

/**
 * Zod schema for validating update roles mutation inputs
 *
 * @property {string} address - The equity contract address
 * @property {Object} roles - Map of role names to boolean values indicating which roles to update
 * @property {string} userAddress - The address of the user whose roles will be updated
 * @property {string} pincode - The pincode for signing the transaction
 */
export const UpdateRolesSchema = z.object({
  address: z.address(),
  roles: z.roles(),
  userAddress: z.address(),
  pincode: z.pincode(),
});

export type UpdateRolesInput = ZodInfer<typeof UpdateRolesSchema>;
