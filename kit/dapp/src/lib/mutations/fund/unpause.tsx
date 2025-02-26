import { handleChallenge } from '@/lib/challenge';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z, type ZodInfer } from '@/lib/utils/zod';
import { useMutation } from '@tanstack/react-query';

/**
 * GraphQL mutation for unpausing a fund contract
 *
 * @remarks
 * Resumes normal operations on a previously paused fund
 */
const FundUnpause = portalGraphql(`
  mutation FundUnpause($address: String!, $from: String!, $challengeResponse: String!) {
    FundUnpause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Zod schema for validating unpause mutation inputs
 *
 * @property {string} address - The fund contract address
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} from - The address of the sender (must have appropriate role)
 */
export const UnPauseSchema = z.object({
  address: z.address(),
  pincode: z.pincode(),
  from: z.address(),
});

/**
 * Type definition for unpause mutation inputs
 */
export type UnPause = ZodInfer<typeof UnPauseSchema>;

/**
 * React Query hook for unpausing a fund contract
 *
 * @returns {Object} Mutation object with additional schema information
 *
 * @example
 * ```tsx
 * const unpause = useUnPause();
 *
 * // Later in your component
 * const handleUnpause = async () => {
 *   try {
 *     await unpause.mutateAsync({
 *       address: "0x123...",
 *       pincode: "123456",
 *       from: "0x789..."
 *     });
 *     toast.success("Fund unpaused successfully");
 *   } catch (error) {
 *     toast.error("Failed to unpause fund");
 *   }
 * };
 * ```
 */
export function useUnPause() {
  const mutation = useMutation({
    mutationKey: ['fund', 'unpause'],
    mutationFn: async ({ pincode, from, address }: UnPause) => {
      const response = await portalClient.request(FundUnpause, {
        address: address,
        from,
        challengeResponse: await handleChallenge(from, pincode),
      });

      return z.hash().parse(response.FundUnpause?.transactionHash);
    },
  });

  return {
    ...mutation,
    inputSchema: UnPauseSchema,
    outputSchema: z.hash(),
    invalidateKeys: () => [['user'], ['transaction'], ['asset']],
  };
}
