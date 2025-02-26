import { handleChallenge } from '@/lib/challenge';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z, type ZodInfer } from '@/lib/utils/zod';
import { useMutation } from '@tanstack/react-query';

/**
 * GraphQL mutation for pausing a bond contract
 *
 * @remarks
 * Temporarily suspends all transfers and operations on the bond
 */
const BondPause = portalGraphql(`
  mutation BondPause($address: String!, $from: String!, $challengeResponse: String!) {
    BondPause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Zod schema for validating pause mutation inputs
 *
 * @property {string} address - The bond contract address
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} from - The address of the sender (must have appropriate role)
 */
export const PauseSchema = z.object({
  address: z.address(),
  pincode: z.pincode(),
  from: z.address(),
});

/**
 * Type definition for pause mutation inputs
 */
export type Pause = ZodInfer<typeof PauseSchema>;

/**
 * React Query hook for pausing a bond contract
 *
 * @returns {Object} Mutation object with additional schema information
 *
 * @example
 * ```tsx
 * const pause = usePause();
 *
 * // Later in your component
 * const handlePause = async () => {
 *   try {
 *     await pause.mutateAsync({
 *       address: "0x123...",
 *       pincode: "123456",
 *       from: "0x789..."
 *     });
 *     toast.success("Bond paused successfully");
 *   } catch (error) {
 *     toast.error("Failed to pause bond");
 *   }
 * };
 * ```
 */
export function usePause() {
  const mutation = useMutation({
    mutationKey: ['bond', 'pause'],
    mutationFn: async ({ pincode, from, address }: Pause) => {
      const response = await portalClient.request(BondPause, {
        address: address,
        from,
        challengeResponse: await handleChallenge(from, pincode),
      });

      return z.hash().parse(response.BondPause?.transactionHash);
    },
  });

  return {
    ...mutation,
    inputSchema: PauseSchema,
    outputSchema: z.hash(),
    invalidateKeys: () => [['user'], ['transaction'], ['asset']],
  };
}
