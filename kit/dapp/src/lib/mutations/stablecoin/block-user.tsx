import { handleChallenge } from '@/lib/challenge';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z, type ZodInfer } from '@/lib/utils/zod';
import { useMutation } from '@tanstack/react-query';

/**
 * GraphQL mutation to block a user from a stablecoin
 *
 * @remarks
 * This adds an address to the blocklist of the stablecoin
 */
const StableCoinBlockUser = portalGraphql(`
  mutation StableCoinBlockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!) {
    StableCoinBlockUser(
      address: $address
      input: { user: $account }
      from: $from
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
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} from - The address of the sender (must have blocklister role)
 * @property {string} account - The account to block
 */
export const BlockUserSchema = z.object({
  address: z.address(),
  pincode: z.pincode(),
  from: z.address(),
  account: z.address(),
});

/**
 * Type definition for block user mutation inputs
 */
export type BlockUser = ZodInfer<typeof BlockUserSchema>;

/**
 * React Query hook for blocking a user from a stablecoin contract
 *
 * @returns {Object} Mutation object with additional schema information
 *
 * @example
 * ```tsx
 * const blockUser = useBlockUser();
 *
 * // Later in your component
 * const handleBlockUser = async () => {
 *   try {
 *     await blockUser.mutateAsync({
 *       address: "0x123...",
 *       pincode: "123456",
 *       from: "0x789...",
 *       account: "0xabc..."
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
    mutationFn: async ({ pincode, from, address, account }: BlockUser) => {
      const response = await portalClient.request(StableCoinBlockUser, {
        address: address,
        account,
        from,
        challengeResponse: await handleChallenge(from, pincode),
      });

      return z.hash().parse(response.StableCoinBlockUser?.transactionHash);
    },
  });

  return {
    ...mutation,
    inputSchema: BlockUserSchema,
    outputSchema: z.hash(),
    invalidateKeys: () => [['user'], ['transaction'], ['asset']],
  };
}
