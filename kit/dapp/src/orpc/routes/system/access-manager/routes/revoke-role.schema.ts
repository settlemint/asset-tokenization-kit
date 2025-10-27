import { UserVerificationSchema } from "@/orpc/routes/common/schemas/user-verification.schema";
import { systemAccessControlRole } from "@atk/zod/access-control-roles";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import * as z from "zod";

/**
 * Input schema for revoking roles from accounts
 * Supports:
 * - Single address, single role
 * - Multiple addresses, single role
 * - Single address, multiple roles
 */
export const RevokeRoleInputSchema = z.object({
  walletVerification: UserVerificationSchema,
  /**
   * The account(s) to revoke the role(s) from
   */
  address: z.union([ethereumAddress, z.array(ethereumAddress)]),
  /**
   * The role(s) to revoke
   */
  role: z.union([systemAccessControlRole, z.array(systemAccessControlRole)]),
});

/**
 * Response schema for revoking roles
 */
export const RevokeRoleOutputSchema = z.object({
  addresses: z.array(ethereumAddress),
  roles: z.array(systemAccessControlRole),
});

/**
 * Type definitions
 */
export type RevokeRoleInput = z.infer<typeof RevokeRoleInputSchema>;
export type RevokeRoleOutput = z.infer<typeof RevokeRoleOutputSchema>;
