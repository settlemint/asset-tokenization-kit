import { handleChallenge } from '@/lib/challenge';
import { getRoleIdentifier, type Role } from '@/lib/config/roles';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z, type ZodInfer } from '@/lib/utils/zod';
import { useMutation } from '@tanstack/react-query';
/**
 * GraphQL mutation for granting a role to a user for a bond
 *
 * @remarks
 * Assigns permissions to an account for interacting with the bond
 */
const GrantRole = portalGraphql(`
  mutation GrantRole($address: String!, $from: String!, $challengeResponse: String!, $input: BondGrantRoleInput!) {
    BondGrantRole(
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
 * Zod schema for validating grant role mutation inputs
 *
 * @property {string} address - The bond contract address
 * @property {Object} roles - Map of role names to boolean values indicating which roles to grant
 * @property {string} userAddress - The address of the user to grant roles to
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} from - The address of the sender (must have appropriate role)
 */
export const GrantRoleSchema = z.object({
  address: z.address(),
  roles: z.roles(),
  userAddress: z.address(),
  pincode: z.pincode(),
  from: z.address(),
});

/**
 * Type definition for grant role mutation inputs
 */
export type GrantRole = ZodInfer<typeof GrantRoleSchema>;

/**
 * Function to grant roles to a user for a bond
 *
 * @param {GrantRole} params - The parameters for granting roles
 * @returns {Promise<string[]>} Array of transaction hashes for each role granted
 *
 * @remarks
 * This function handles granting multiple roles in separate transactions
 */
export async function grantRole({
  address,
  roles,
  userAddress,
  pincode,
  from,
}: GrantRole) {
  const selectedRoles = Object.entries(roles)
    .filter(([, enabled]) => enabled)
    .map(([role]) => role as Role);

  const transactions: string[] = [];

  for (const role of selectedRoles) {
    const response = await portalClient.request(GrantRole, {
      address: address,
      from,
      input: {
        role: getRoleIdentifier(role),
        account: userAddress,
      },
      challengeResponse: await handleChallenge(from, pincode),
    });

    if (response.BondGrantRole?.transactionHash) {
      transactions.push(response.BondGrantRole?.transactionHash);
    }
  }

  return z.array(z.hash()).parse(transactions);
}

/**
 * React Query hook for granting roles to a user for a bond
 *
 * @returns {Object} Mutation object with additional schema information
 *
 * @example
 * ```tsx
 * const grantRole = useGrantRole();
 *
 * // Later in your component
 * const handleGrantRole = async () => {
 *   try {
 *     await grantRole.mutateAsync({
 *       address: "0x123...",
 *       roles: { minter: true, burner: true },
 *       userAddress: "0x456...",
 *       pincode: "123456",
 *       from: "0x789..."
 *     });
 *     toast.success("Roles granted successfully");
 *   } catch (error) {
 *     toast.error("Failed to grant roles");
 *   }
 * };
 * ```
 */
export function useGrantRole() {
  const mutation = useMutation({
    mutationKey: ['bond', 'grant-role'],
    mutationFn: async ({
      pincode,
      from,
      address,
      roles,
      userAddress,
    }: GrantRole) => {
      return grantRole({ address, roles, userAddress, pincode, from });
    },
  });

  return {
    ...mutation,
    inputSchema: GrantRoleSchema,
    outputSchema: z.hashes(),
    invalidateKeys: () => [['user'], ['transaction'], ['asset']],
  };
}
