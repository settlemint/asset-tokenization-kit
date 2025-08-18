import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { assetAccessControlRole } from "@atk/zod/validators/access-control-roles";
import { ethereumAddress } from "@atk/zod/validators/ethereum-address";
import { z } from "zod";

/**
 * Input schema for revoking roles from accounts on a token
 * Supports:
 * - Single address, single role
 * - Multiple addresses, single role
 * - Single address, multiple roles
 */
export const TokenRevokeRoleInputSchema =
  MutationInputSchemaWithContract.extend({
    /** The account(s) to revoke the role(s) from */
    address: z.union([ethereumAddress, z.array(ethereumAddress)]),
    /** The role(s) to revoke (limited to asset access control roles) */
    role: z.union([assetAccessControlRole, z.array(assetAccessControlRole)]),
  });

/**
 * Response schema for revoking roles on a token
 */
export const TokenRevokeRoleOutputSchema = z.object({
  addresses: z.array(ethereumAddress),
  roles: z.array(assetAccessControlRole),
});

export type TokenRevokeRoleInput = z.infer<typeof TokenRevokeRoleInputSchema>;
export type TokenRevokeRoleOutput = z.infer<typeof TokenRevokeRoleOutputSchema>;
