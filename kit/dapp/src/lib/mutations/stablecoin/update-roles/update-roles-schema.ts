import { z, type ZodInfer } from "@/lib/utils/zod";

/**
 * Zod schema for validating update roles mutation inputs
 *
 * @property {string} address - The stablecoin contract address
 * @property {Role[]} roles - Array of roles to assign to the user
 * @property {string} userAddress - The address of the user whose roles will be updated
 * @property {string} pincode - The pincode for signing the transaction
 */
export const UpdateRolesSchema = z.object({
  address: z.address(),
  roles: z
    .array(
      z.enum([
        "DEFAULT_ADMIN_ROLE",
        "SUPPLY_MANAGEMENT_ROLE",
        "USER_MANAGEMENT_ROLE",
      ])
    )
    .min(1, "At least one role must be selected"),
  userAddress: z.address(),
  pincode: z.pincode(),
});

export type UpdateRolesInput = ZodInfer<typeof UpdateRolesSchema>;
