import { accessControlRole } from "@/lib/zod/validators/access-control-roles";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { UserVerificationSchema } from "@/orpc/routes/common/schemas/user-verification.schema";
import { z } from "zod";

/**
 * Input schema for granting a role to multiple accounts
 */
export const GrantRoleInputSchema = z.object({
  verification: UserVerificationSchema,
  /**
   * The accounts to grant the roles to
   */
  accounts: z.array(ethereumAddress),
  /**
   * The role to grant to the accounts
   */
  role: accessControlRole,
});

/**
 * Response schema for granting a role to multiple accounts
 */
export const GrantRoleOutputSchema = z.object({
  accounts: z.array(ethereumAddress),
});

/**
 * Type definitions
 */
export type GrantRoleInput = z.infer<typeof GrantRoleInputSchema>;
export type GrantRoleOutput = z.infer<typeof GrantRoleOutputSchema>;
