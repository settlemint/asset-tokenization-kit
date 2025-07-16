import { portalGraphql } from "@/lib/settlemint/portal";
import type { ValidatedPortalClient } from "@/orpc/middlewares/services/portal.middleware";
import { z } from "zod";

/**
 * Role names used in the token contracts
 */
export const TOKEN_ROLES = {
  MINTER: "MINTER_ROLE",
  BURNER: "BURNER_ROLE",
  PAUSER: "PAUSER_ROLE",
  FREEZER: "FREEZER_ROLE",
  CUSTODIAN: "CUSTODIAN_ROLE",
  REDEEMER: "REDEEMER_ROLE",
  CAP_SETTER: "CAP_SETTER_ROLE",
  YIELD_MANAGER: "YIELD_MANAGER_ROLE",
  COMPLIANCE_MANAGER: "COMPLIANCE_MANAGER_ROLE",
  RECOVERY_AGENT: "RECOVERY_AGENT_ROLE",
} as const;

export type TokenRole = (typeof TOKEN_ROLES)[keyof typeof TOKEN_ROLES];

/**
 * GraphQL query to check if an address has a specific role
 */
const HAS_ROLE_QUERY = portalGraphql(`
  query HasRole($contract: String!, $account: String!, $role: String!) {
    hasRole: IAccessControlHasRole(
      address: $contract
      account: $account
      role: $role
    ) {
      hasRole
    }
  }
`);

/**
 * Check if an account has a specific role on a contract
 * @param client - The portal client
 * @param contract - The contract address
 * @param account - The account to check
 * @param role - The role to check
 * @returns true if the account has the role, false otherwise
 */
export async function hasRole(
  client: ValidatedPortalClient,
  contract: string,
  account: string,
  role: TokenRole
): Promise<boolean> {
  try {
    const result = await client.query(
      HAS_ROLE_QUERY,
      {
        contract,
        account,
        role,
      },
      z.object({
        hasRole: z.object({
          hasRole: z.boolean(),
        }),
      }),
      "Failed to check role"
    );

    return result.hasRole.hasRole;
  } catch {
    // If the contract doesn't implement IAccessControl, assume no role
    return false;
  }
}

/**
 * Validate that an account has the required role, throwing if not
 * @param client - The portal client
 * @param contract - The contract address
 * @param account - The account to check
 * @param role - The role to check
 * @param operation - The operation name for error messages
 * @throws ORPCError if the account doesn't have the required role
 */
export async function validateRole(
  client: ValidatedPortalClient,
  contract: string,
  account: string,
  role: TokenRole,
  operation: string
): Promise<void> {
  const hasRequiredRole = await hasRole(client, contract, account, role);

  if (!hasRequiredRole) {
    throw new Error(
      `Account ${account} does not have the required ${role} to perform ${operation}`
    );
  }
}
