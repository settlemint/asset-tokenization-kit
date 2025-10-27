import { UserVerificationSchema } from "@/orpc/routes/common/schemas/user-verification.schema";
import { systemAccessControlRole } from "@atk/zod/access-control-roles";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import * as z from "zod";

/**
 * Input schema for granting roles to accounts
 * Supports:
 * - Single address, single role
 * - Multiple addresses, single role
 * - Single address, multiple roles
 */
export const GrantRoleInputSchema = z.object({
  walletVerification: UserVerificationSchema,
  /**
   * The account(s) to grant the role(s) to
   */
  address: z.union([ethereumAddress, z.array(ethereumAddress)]),
  /**
   * The role(s) to grant
   */
  role: z.union([systemAccessControlRole, z.array(systemAccessControlRole)]),
});

/**
 * Response schema for granting roles
 */
export const GrantRoleOutputSchema = z.object({
  addresses: z.array(ethereumAddress),
  roles: z.array(systemAccessControlRole),
});

/**
 * Type definitions
 */
export type GrantRoleInput = z.input<typeof GrantRoleInputSchema>;
export type GrantRoleOutput = z.infer<typeof GrantRoleOutputSchema>;
