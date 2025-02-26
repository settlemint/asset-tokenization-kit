import { revokeRole } from '@/lib/mutations/stablecoin/revoke-role';
import { getQueryKey as getStablecoinDetailQueryKey } from '@/lib/queries/stablecoin/stablecoin-detail';
import { getQueryKey as getStablecoinListQueryKey } from '@/lib/queries/stablecoin/stablecoin-list';
import { z, type ZodInfer } from '@/lib/utils/zod';
import { useMutation } from '@tanstack/react-query';
import type { Hash } from 'viem';
import { grantRole } from './grant-role';

/**
 * Zod schema for validating update roles mutation inputs
 *
 * @property {string} address - The stablecoin contract address
 * @property {Object} roles - Map of role names to boolean values indicating which roles to update
 * @property {string} userAddress - The address of the user whose roles will be updated
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} from - The address of the sender (must have appropriate role)
 */
export const UpdateRolesSchema = z.object({
  address: z.address(),
  roles: z.roles(),
  userAddress: z.address(),
  pincode: z.pincode(),
  from: z.address(),
});

/**
 * Type definition for update roles mutation inputs
 */
export type UpdateRoles = ZodInfer<typeof UpdateRolesSchema>;

/**
 * React Query hook for updating a user's roles for a stablecoin
 *
 * @returns {Object} Mutation object with additional schema information
 *
 * @remarks
 * This hook combines both granting and revoking roles in a single operation.
 * It processes both operations in parallel and returns an array of transaction hash arrays.
 *
 * @example
 * ```tsx
 * const updateRoles = useUpdateRoles();
 *
 * // Later in your component
 * const handleUpdateRoles = async () => {
 *   try {
 *     await updateRoles.mutateAsync({
 *       address: "0x123...",
 *       roles: { minter: true, burner: false, pauser: true },
 *       userAddress: "0x456...",
 *       pincode: "123456",
 *       from: "0x789..."
 *     });
 *     toast.success("Roles updated successfully");
 *   } catch (error) {
 *     toast.error("Failed to update roles");
 *   }
 * };
 * ```
 */
export function useUpdateRoles() {
  const mutation = useMutation({
    mutationKey: ['stablecoin', 'update-roles'],
    mutationFn: async ({
      pincode,
      from,
      address,
      roles,
      userAddress,
    }: UpdateRoles) => {
      const transactions: Promise<Hash[]>[] = [];

      // Handle role granting
      transactions.push(
        grantRole({ address, roles, userAddress, pincode, from })
      );

      // Handle role revocations
      transactions.push(
        revokeRole({ address, roles, userAddress, pincode, from })
      );

      return z.array(z.array(z.hash())).parse(await Promise.all(transactions));
    },
  });

  return {
    ...mutation,
    inputSchema: UpdateRolesSchema,
    outputSchema: z.array(z.array(z.hash())),
    invalidateKeys: (variables: UpdateRoles) => [
      // Invalidate the stablecoin list
      getStablecoinListQueryKey(),
      // Invalidate the specific stablecoin details using the query function
      getStablecoinDetailQueryKey({ address: variables.address }),
    ],
  };
}
