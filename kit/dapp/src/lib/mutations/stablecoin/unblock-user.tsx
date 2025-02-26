import { handleChallenge } from '@/lib/challenge';
import { getQueryKey as getStablecoinDetailQueryKey } from '@/lib/queries/stablecoin/stablecoin-detail';
import { getQueryKey as getStablecoinListQueryKey } from '@/lib/queries/stablecoin/stablecoin-list';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z, type ZodInfer } from '@/lib/utils/zod';
import { useMutation } from '@tanstack/react-query';

/**
 * GraphQL mutation for unblocking a user from using a stablecoin
 *
 * @remarks
 * Restores a previously blocked user's ability to interact with the stablecoin
 */
const StableCoinUnblockUser = portalGraphql(`
  mutation StableCoinUnblockUser($address: String!, $challengeResponse: String!, $from: String!, $user: String!) {
    StableCoinUnblockUser(
      from: $from
      input: {user: $user}
      address: $address
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Zod schema for validating unblock user mutation inputs
 *
 * @property {string} address - The stablecoin contract address
 * @property {string} userAddress - The address of the user to unblock
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} from - The address of the sender (must have appropriate role)
 */
export const UnblockUserSchema = z.object({
  address: z.address(),
  userAddress: z.address(),
  pincode: z.pincode(),
  from: z.address(),
});

/**
 * Type definition for unblock user mutation inputs
 */
export type UnblockUser = ZodInfer<typeof UnblockUserSchema>;

/**
 * React Query hook for unblocking a user from using a stablecoin
 *
 * @returns {Object} Mutation object with additional schema information
 *
 * @example
 * ```tsx
 * const unblockUser = useUnblockUser();
 *
 * // Later in your component
 * const handleUnblock = async () => {
 *   try {
 *     await unblockUser.mutateAsync({
 *       address: "0x123...",
 *       userAddress: "0x456...",
 *       pincode: "123456",
 *       from: "0x789..."
 *     });
 *     toast.success("User unblocked successfully");
 *   } catch (error) {
 *     toast.error("Failed to unblock user");
 *   }
 * };
 * ```
 */
export function useUnblockUser() {
  const mutation = useMutation({
    mutationKey: ['stablecoin', 'unblock-user'],
    mutationFn: async ({
      pincode,
      from,
      address,
      userAddress,
    }: UnblockUser) => {
      const response = await portalClient.request(StableCoinUnblockUser, {
        address: address,
        from,
        user: userAddress,
        challengeResponse: await handleChallenge(from, pincode),
      });

      return z.hash().parse(response.StableCoinUnblockUser?.transactionHash);
    },
  });

  return {
    ...mutation,
    inputSchema: UnblockUserSchema,
    outputSchema: z.hash(),
    invalidateKeys: (variables: UnblockUser) => [
      // Invalidate the stablecoin list
      getStablecoinListQueryKey(),
      // Invalidate the specific stablecoin details using the query function
      getStablecoinDetailQueryKey({ address: variables.address }),
    ],
  };
}
