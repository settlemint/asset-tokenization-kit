import { accessControlRole } from "@/lib/zod/validators/access-control-roles";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { UserVerificationSchema } from "@/orpc/routes/common/schemas/user-verification.schema";
import { z } from "zod";

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
  role: z.union([accessControlRole, z.array(accessControlRole)]),
});

/**
 * Response schema for revoking roles
 */
export const RevokeRoleOutputSchema = z.object({
  addresses: z.array(ethereumAddress),
  roles: z.array(accessControlRole),
});

/**
 * Type definitions
 */
export type RevokeRoleInput = z.infer<typeof RevokeRoleInputSchema>;
export type RevokeRoleOutput = z.infer<typeof RevokeRoleOutputSchema>;
