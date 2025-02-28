import { z, type ZodInfer } from '@/lib/utils/zod';

/**
 * Zod schema for validating grant role mutation inputs
 *
 * @property {string} address - The fund contract address
 * @property {string} role - The role to grant (ADMIN, SUPPLY_MANAGER, USER_MANAGER)
 * @property {string} account - The account to grant the role to
 * @property {string} pincode - User's pincode for authentication
 */
export const GrantRoleSchema = z.object({
  address: z.address(),
  role: z.enum(['ADMIN', 'SUPPLY_MANAGER', 'USER_MANAGER']),
  account: z.address(),
  pincode: z.pincode(),
});

export type GrantRoleInput = ZodInfer<typeof GrantRoleSchema>;
