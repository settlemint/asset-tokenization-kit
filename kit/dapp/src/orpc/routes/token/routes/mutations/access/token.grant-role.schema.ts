import { assetAccessControlRole } from "@/lib/zod/validators/access-control-roles";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { UserVerificationSchema } from "@/orpc/routes/common/schemas/user-verification.schema";
import { z } from "zod";

/**
 * Input schema for granting a role to multiple accounts on a token
 */
export const TokenGrantRoleInputSchema = MutationInputSchemaWithContract.extend(
  {
    verification: UserVerificationSchema,
    /**
     * The accounts to grant the roles to
     */
    accounts: z.array(ethereumAddress),
    /**
     * The role to grant to the accounts (limited to asset access control roles)
     */
    role: assetAccessControlRole,
  }
);

/**
 * Response schema for granting a role to multiple accounts on a token
 */
export const TokenGrantRoleOutputSchema = z.object({
  accounts: z.array(ethereumAddress),
});

/**
 * Type definitions
 */
export type TokenGrantRoleInput = z.infer<typeof TokenGrantRoleInputSchema>;
export type TokenGrantRoleOutput = z.infer<typeof TokenGrantRoleOutputSchema>;
