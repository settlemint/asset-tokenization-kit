import { handleChallenge } from '@/lib/challenge';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z, type ZodInfer } from '@/lib/utils/zod';
import { useMutation } from '@tanstack/react-query';

/**
 * GraphQL mutation for pausing a stablecoin contract
 *
 * @remarks
 * Temporarily suspends all transfers and operations on the stablecoin
 */
const Pause = portalGraphql(`
  mutation PauseStablecoin($address: String!, $from: String!, $challengeResponse: String!) {
    StableCoinPause(
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
 * @property {string} address - The stablecoin contract address
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
 * React Query hook for pausing a stablecoin contract
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
 *     toast.success("Stablecoin paused successfully");
 *   } catch (error) {
 *     toast.error("Failed to pause stablecoin");
 *   }
 * };
 * ```
 */
export function usePause() {
  const mutation = useMutation({
    mutationKey: ['stablecoin', 'pause'],
    mutationFn: async ({ pincode, from, address }: Pause) => {
      const response = await portalClient.request(Pause, {
        address: address,
        from,
        challengeResponse: await handleChallenge(from, pincode),
      });

      return z.hash().parse(response.StableCoinPause?.transactionHash);
    },
  });

  return {
    ...mutation,
    inputSchema: PauseSchema,
    outputSchema: z.hash(),
  };
}
