import { handleChallenge } from '@/lib/challenge';
import { getEquityDetail } from '@/lib/queries/equity/equity-detail';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z, type ZodInfer } from '@/lib/utils/zod';
import { useMutation } from '@tanstack/react-query';
import { parseUnits } from 'viem';

/**
 * GraphQL mutation to mint new equity tokens
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const EquityMint = portalGraphql(`
  mutation EquityMint($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!) {
    EquityMint(
      address: $address
      from: $from
      input: {amount: $amount, to: $to}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Zod schema for validating mint mutation inputs
 *
 * @property {string} address - The equity contract address
 * @property {number} amount - The amount of tokens to mint
 * @property {string} to - The recipient address
 * @property {string} pincode - User's pincode for authentication
 * @property {string} from - The sender's wallet address
 */
export const MintSchema = z.object({
  address: z.address(),
  amount: z.amount(),
  to: z.address(),
  pincode: z.pincode(),
  from: z.address(),
});

/**
 * Type definition for mint mutation parameters
 */
export type Mint = ZodInfer<typeof MintSchema>;

/**
 * Hook for minting new equity tokens
 *
 * @returns A mutation object with methods to trigger the mint operation
 *
 * @example
 * ```tsx
 * const mintMutation = useMint();
 *
 * // Later in your code
 * mintMutation.mutate({
 *   address: "0x...",
 *   amount: 100,
 *   to: "0x...",
 *   pincode: "123456",
 *   from: "0x..."
 * });
 * ```
 */
export function useMint() {
  const mutation = useMutation({
    mutationKey: ['equity', 'mint'],
    mutationFn: async ({ pincode, from, address, amount, to }: Mint) => {
      const { decimals } = await getEquityDetail({ address });

      const response = await portalClient.request(EquityMint, {
        address: address,
        from,
        amount: parseUnits(amount.toString(), decimals).toString(),
        to,
        challengeResponse: await handleChallenge(from, pincode),
      });

      return z.hash().parse(response.EquityMint?.transactionHash);
    },
  });

  return {
    ...mutation,
    inputSchema: MintSchema,
    outputSchema: z.hash(),
    invalidateKeys: () => [['user'], ['transaction'], ['asset']],
  };
}
