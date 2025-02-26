import { handleChallenge } from '@/lib/challenge';
import { getRoleIdentifier, type Role } from '@/lib/config/roles';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z, type ZodInfer } from '@/lib/utils/zod';
import { useMutation } from '@tanstack/react-query';

/**
 * GraphQL mutation for revoking a role from a user for a equity
 *
 * @remarks
 * Removes permissions from an account for interacting with the equity
 */
const RevokeRole = portalGraphql(`
  mutation RevokeRole($address: String!, $from: String!, $challengeResponse: String!, $input: EquityRevokeRoleInput!) {
    EquityRevokeRole(
      from: $from
      input: $input
      address: $address
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Zod schema for validating revoke role mutation inputs
 *
 * @property {string} address - The equity contract address
 * @property {Object} roles - Map of role names to boolean values indicating which roles to revoke
 * @property {string} userAddress - The address of the user to revoke roles from
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} from - The address of the sender (must have appropriate role)
 */
export const RevokeRoleSchema = z.object({
  address: z.address(),
  roles: z.roles(),
  userAddress: z.address(),
  pincode: z.pincode(),
  from: z.address(),
});

/**
 * Type definition for revoke role mutation inputs
 */
export type RevokeRole = ZodInfer<typeof RevokeRoleSchema>;

/**
 * Function to revoke roles from a user for a equity
 *
 * @param {RevokeRole} params - The parameters for revoking roles
 * @returns {Promise<string[]>} Array of transaction hashes for each role revoked
 *
 * @remarks
 * This function handles revoking multiple roles in separate transactions
 */
export async function revokeRole({
  address,
  roles,
  userAddress,
  pincode,
  from,
}: RevokeRole) {
  const selectedRoles = Object.entries(roles)
    .filter(([, enabled]) => enabled)
    .map(([role]) => role as Role);

  const transactions: string[] = [];

  for (const role of selectedRoles) {
    const response = await portalClient.request(RevokeRole, {
      address: address,
      from,
      input: {
        role: getRoleIdentifier(role),
        account: userAddress,
      },
      challengeResponse: await handleChallenge(from, pincode),
    });

    if (response.EquityRevokeRole?.transactionHash) {
      transactions.push(response.EquityRevokeRole?.transactionHash);
    }
  }

  return z.array(z.hash()).parse(transactions);
}

/**
 * React Query hook for revoking roles from a user for a equity
 *
 * @returns {Object} Mutation object with additional schema information
 *
 * @example
 * ```tsx
 * const revokeRole = useRevokeRole();
 *
 * // Later in your component
 * const handleRevokeRole = async () => {
 *   try {
 *     await revokeRole.mutateAsync({
 *       address: "0x123...",
 *       roles: { minter: true, burner: true },
 *       userAddress: "0x456...",
 *       pincode: "123456",
 *       from: "0x789..."
 *     });
 *     toast.success("Roles revoked successfully");
 *   } catch (error) {
 *     toast.error("Failed to revoke roles");
 *   }
 * };
 * ```
 */
export function useRevokeRole() {
  const mutation = useMutation({
    mutationKey: ['equity', 'revoke-role'],
    mutationFn: async ({
      pincode,
      from,
      address,
      roles,
      userAddress,
    }: RevokeRole) => {
      return revokeRole({ address, roles, userAddress, pincode, from });
    },
  });

  return {
    ...mutation,
    inputSchema: RevokeRoleSchema,
    outputSchema: z.array(z.hash()),
    invalidateKeys: () => [['user'], ['transaction'], ['asset']],
  };
}
