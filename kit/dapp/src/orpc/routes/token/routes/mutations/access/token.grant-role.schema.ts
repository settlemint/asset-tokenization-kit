import { assetAccessControlRole } from "@/lib/zod/validators/access-control-roles";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { z } from "zod";

/**
 * Input schema for granting roles on a token
 * Supports:
 * - Multiple accounts, single role
 * - Single account, multiple roles
 */
const GrantToManyAccountsSchema = MutationInputSchemaWithContract.extend({
  /** The accounts to grant the role to */
  accounts: z.array(ethereumAddress).min(1),
  /** The role to grant to the accounts */
  role: assetAccessControlRole,
});

const GrantMultipleRolesToOneAccountSchema =
  MutationInputSchemaWithContract.extend({
    /** The account to grant roles to */
    address: ethereumAddress,
    /** The roles to grant to the account */
    roles: z.array(assetAccessControlRole).min(1),
  });

export const TokenGrantRoleInputSchema = z.union([
  GrantToManyAccountsSchema,
  GrantMultipleRolesToOneAccountSchema,
]);

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
