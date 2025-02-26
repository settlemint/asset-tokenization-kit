import { handleChallenge } from '@/lib/challenge';
import {
  getStableCoinDetail,
  getQueryKey as getStablecoinDetailQueryKey,
} from '@/lib/queries/stablecoin/stablecoin-detail';
import { getQueryKey as getStablecoinListQueryKey } from '@/lib/queries/stablecoin/stablecoin-list';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z, type ZodInfer } from '@/lib/utils/zod';
import { useMutation } from '@tanstack/react-query';
import { parseUnits } from 'viem';

/**
 * GraphQL mutation for burning stablecoin tokens
 *
 * @remarks
 * Reduces the total supply of the stablecoin by removing tokens from circulation
 */
const StableCoinBurn = portalGraphql(`
  mutation StableCoinBurn($address: String!, $from: String!, $challengeResponse: String!, $amount: String!) {
    StableCoinBurn(
      address: $address
      from: $from
      input: {value: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Zod schema for validating burn mutation inputs
 *
 * @property {string} address - The stablecoin contract address
 * @property {number} amount - The amount of tokens to burn
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} from - The address of the sender (must have appropriate role)
 */
export const BurnSchema = z.object({
  address: z.address(),
  amount: z.amount(),
  pincode: z.pincode(),
  from: z.address(),
});

/**
 * Type definition for burn mutation inputs
 */
export type Burn = ZodInfer<typeof BurnSchema>;

/**
 * React Query hook for burning stablecoin tokens
 *
 * @returns {Object} Mutation object with additional schema information
 *
 * @remarks
 * Automatically fetches the token decimals and converts the amount to the correct units
 *
 * @example
 * ```tsx
 * const burn = useBurn();
 *
 * // Later in your component
 * const handleBurn = async () => {
 *   try {
 *     await burn.mutateAsync({
 *       address: "0x123...",
 *       amount: 100,
 *       pincode: "123456",
 *       from: "0x789..."
 *     });
 *     toast.success("Tokens burned successfully");
 *   } catch (error) {
 *     toast.error("Failed to burn tokens");
 *   }
 * };
 * ```
 */
export function useBurn() {
  const mutation = useMutation({
    mutationKey: ['stablecoin', 'burn'],
    mutationFn: async ({ pincode, from, address, amount }: Burn) => {
      const { decimals } = await getStableCoinDetail({ address });

      const response = await portalClient.request(StableCoinBurn, {
        address: address,
        from,
        amount: parseUnits(amount.toString(), decimals).toString(),
        challengeResponse: await handleChallenge(from, pincode),
      });

      return z.hash().parse(response.StableCoinBurn?.transactionHash);
    },
  });

  return {
    ...mutation,
    inputSchema: BurnSchema,
    outputSchema: z.hash(),
    invalidateKeys: (variables: Burn) => [
      // Invalidate the stablecoin list
      getStablecoinListQueryKey(),
      // Invalidate the specific stablecoin details using the query function
      getStablecoinDetailQueryKey({ address: variables.address }),
    ],
  };
}
