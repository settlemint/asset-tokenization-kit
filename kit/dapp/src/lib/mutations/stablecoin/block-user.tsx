import { handleChallenge } from '@/lib/challenge';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z, type ZodInfer } from '@/lib/utils/zod';
import { useMutation } from '@tanstack/react-query';

/**
 * GraphQL mutation for blocking a user from using a stablecoin
 *
 * @remarks
 * Requires the sender to have the appropriate role to block users
 */
const BlockUser = portalGraphql(`
  mutation BlockUser($address: String!, $challengeResponse: String!, $from: String!, $user: String!) {
    StableCoinBlockUser(
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
 * Zod schema for validating block user mutation inputs
 *
 * @property {string} address - The stablecoin contract address
 * @property {string} userAddress - The address of the user to block
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} from - The address of the sender (must have appropriate role)
 */
export const BlockUserSchema = z.object({
  address: z.address(),
  userAddress: z.address(),
  pincode: z.pincode(),
  from: z.address(),
});

/**
 * Type definition for block user mutation inputs
 */
export type BlockUser = ZodInfer<typeof BlockUserSchema>;

/**
 * React Query hook for blocking a user from using a stablecoin
 *
 * @returns {Object} Mutation object with additional schema information
 *
 * @example
 * ```tsx
 * const blockUser = useBlockUser();
 *
 * // Later in your component
 * const handleBlock = async () => {
 *   try {
 *     await blockUser.mutateAsync({
 *       address: "0x123...",
 *       userAddress: "0x456...",
 *       pincode: "123456",
 *       from: "0x789..."
 *     });
 *     toast.success("User blocked successfully");
 *   } catch (error) {
 *     toast.error("Failed to block user");
 *   }
 * };
 * ```
 */
export function useBlockUser() {
  const mutation = useMutation({
    mutationKey: ['stablecoin', 'block-user'],
    mutationFn: async ({ pincode, from, address, userAddress }: BlockUser) => {
      const response = await portalClient.request(BlockUser, {
        address: address,
        from,
        user: userAddress,
        challengeResponse: await handleChallenge(from, pincode),
      });

      return z.hash().parse(response.StableCoinBlockUser?.transactionHash);
    },
  });

  return {
    ...mutation,
    inputSchema: BlockUserSchema,
    outputSchema: z.hash(),
  };
}
