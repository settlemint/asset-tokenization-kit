import { accessControlRole } from "@/lib/zod/validators/access-control-roles";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { UserVerificationSchema } from "@/orpc/routes/common/schemas/user-verification.schema";
import { z } from "zod";

/**
 * Input schema for revoking a role from multiple accounts
 */
export const RevokeRoleInputSchema = z.object({
  verification: UserVerificationSchema,
  /**
   * The accounts to revoke the roles from
   */
  accounts: z.array(ethereumAddress),
  /**
   * The role to revoke from the accounts
   */
  role: accessControlRole,
});

/**
 * Response schema for revoking a role from multiple accounts
 */
export const RevokeRoleOutputSchema = z.object({
  accounts: z.array(ethereumAddress),
});

/**
 * Type definitions
 */
export type RevokeRoleInput = z.infer<typeof RevokeRoleInputSchema>;
export type RevokeRoleOutput = z.infer<typeof RevokeRoleOutputSchema>;
