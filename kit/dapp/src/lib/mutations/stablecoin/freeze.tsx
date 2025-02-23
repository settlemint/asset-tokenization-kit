import { handleChallenge } from '@/lib/challenge';
import { getStableCoinDetail } from '@/lib/queries/stablecoin/stablecoin-detail';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z, type ZodInfer } from '@/lib/utils/zod';
import { useMutation } from '@tanstack/react-query';
import { parseUnits } from 'viem';

/**
 * GraphQL mutation for freezing a user's stablecoin tokens
 *
 * @remarks
 * Prevents a specific amount of tokens from being transferred by the user
 */
const Freeze = portalGraphql(`
  mutation Freeze($address: String!, $challengeResponse: String!, $from: String!, $user: String!, $amount: String!) {
    StableCoinFreeze(
      address: $address
      from: $from
      input: {user: $user, amount: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Zod schema for validating freeze mutation inputs
 *
 * @property {string} address - The stablecoin contract address
 * @property {string} userAddress - The address of the user whose tokens will be frozen
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} from - The address of the sender (must have appropriate role)
 * @property {number} amount - The amount of tokens to freeze
 */
export const FreezeSchema = z.object({
  address: z.address(),
  userAddress: z.address(),
  pincode: z.pincode(),
  from: z.address(),
  amount: z.amount(),
});

/**
 * Type definition for freeze mutation inputs
 */
export type Freeze = ZodInfer<typeof FreezeSchema>;

/**
 * React Query hook for freezing a user's stablecoin tokens
 *
 * @returns {Object} Mutation object with additional schema information
 *
 * @remarks
 * Automatically fetches the token decimals and converts the amount to the correct units
 *
 * @example
 * ```tsx
 * const freeze = useFreeze();
 *
 * // Later in your component
 * const handleFreeze = async () => {
 *   try {
 *     await freeze.mutateAsync({
 *       address: "0x123...",
 *       userAddress: "0x456...",
 *       amount: 100,
 *       pincode: "123456",
 *       from: "0x789..."
 *     });
 *     toast.success("Tokens frozen successfully");
 *   } catch (error) {
 *     toast.error("Failed to freeze tokens");
 *   }
 * };
 * ```
 */
export function useFreeze() {
  const mutation = useMutation({
    mutationFn: async ({
      pincode,
      from,
      address,
      userAddress,
      amount,
    }: Freeze) => {
      const { decimals } = await getStableCoinDetail({ address });

      const response = await portalClient.request(Freeze, {
        address: address,
        from,
        user: userAddress,
        challengeResponse: await handleChallenge(from, pincode),
        amount: parseUnits(amount.toString(), decimals).toString(),
      });

      return z.hash().parse(response.StableCoinFreeze?.transactionHash);
    },
  });

  return {
    ...mutation,
    inputSchema: FreezeSchema,
    outputSchema: z.hash(),
  };
}
