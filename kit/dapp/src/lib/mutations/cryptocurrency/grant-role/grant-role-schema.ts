import { z, type ZodInfer } from '@/lib/utils/zod';

/**
 * Zod schema for validating grant role mutation inputs
 *
 * @property {string} address - The cryptocurrency contract address
 * @property {string} user - The address of the user to grant the role to
 * @property {string} role - The role to grant
 * @property {string} pincode - User's pincode for authentication
 */
export const GrantRoleSchema = z.object({
  address: z.address(),
  user: z.address(),
  role: z.string(),
  pincode: z.pincode(),
});

export type GrantRoleInput = ZodInfer<typeof GrantRoleSchema>;
