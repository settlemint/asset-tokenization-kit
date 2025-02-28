import { z, type ZodInfer } from '@/lib/utils/zod';

/**
 * Zod schema for validating revoke role mutation inputs
 *
 * @property {string} address - The cryptocurrency contract address
 * @property {string} role - The role to revoke (ADMIN, SUPPLY_MANAGER, USER_MANAGER)
 * @property {string} account - The account to revoke the role from
 * @property {string} pincode - User's pincode for authentication
 */
export const RevokeRoleSchema = z.object({
  address: z.address(),
  role: z.enum(['ADMIN', 'SUPPLY_MANAGER', 'USER_MANAGER']),
  account: z.address(),
  pincode: z.pincode(),
});

export type RevokeRoleInput = ZodInfer<typeof RevokeRoleSchema>;
