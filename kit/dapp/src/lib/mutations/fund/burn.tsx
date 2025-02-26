import { handleChallenge } from '@/lib/challenge';
import { getFundDetail } from '@/lib/queries/fund/fund-detail';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z, type ZodInfer } from '@/lib/utils/zod';
import { useMutation } from '@tanstack/react-query';
import { parseUnits } from 'viem';

/**
 * GraphQL mutation for burning fund tokens
 *
 * @remarks
 * Reduces the total supply of the fund by removing tokens from circulation
 */
const FundBurn = portalGraphql(`
  mutation FundBurn($address: String!, $from: String!, $challengeResponse: String!, $amount: String!) {
    FundBurn(
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
 * @property {string} address - The fund contract address
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
 * React Query hook for burning fund tokens
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
    mutationKey: ['fund', 'burn'],
    mutationFn: async ({ pincode, from, address, amount }: Burn) => {
      const { decimals } = await getFundDetail({ address });

      const response = await portalClient.request(FundBurn, {
        address: address,
        from,
        amount: parseUnits(amount.toString(), decimals).toString(),
        challengeResponse: await handleChallenge(from, pincode),
      });

      return z.hash().parse(response.FundBurn?.transactionHash);
    },
  });

  return {
    ...mutation,
    inputSchema: BurnSchema,
    outputSchema: z.hash(),
    invalidateKeys: () => [['user'], ['transaction'], ['asset']],
  };
}
