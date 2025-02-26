import { handleChallenge } from '@/lib/challenge';
import { getEquityDetail } from '@/lib/queries/equity/equity-detail';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z, type ZodInfer } from '@/lib/utils/zod';
import { useMutation } from '@tanstack/react-query';
import { parseUnits } from 'viem';

/**
 * GraphQL mutation to freeze a specific user account from a equity
 */
const EquityFreeze = portalGraphql(`
  mutation EquityFreeze($address: String!, $challengeResponse: String!, $from: String!, $user: String!, $amount: String!) {
    EquityFreeze(
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
 * Zod schema for validating freeze account mutation inputs
 *
 * @property {string} address - The equity contract address
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} from - The address of the sender (must have blocklister role)
 * @property {string} account - The account to freeze
 */
export const FreezeSchema = z.object({
  address: z.address(),
  userAddress: z.address(),
  pincode: z.pincode(),
  from: z.address(),
  amount: z.amount(),
});

/**
 * Type definition for freeze account mutation inputs
 */
export type Freeze = ZodInfer<typeof FreezeSchema>;

/**
 * React Query hook for freezing an account in a equity contract
 *
 * @returns {Object} Mutation object with additional schema information
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
 *       pincode: "123456",
 *       from: "0x789...",
 *       account: "0xabc..."
 *     });
 *     toast.success("Account frozen successfully");
 *   } catch (error) {
 *     toast.error("Failed to freeze account");
 *   }
 * };
 * ```
 */
export function useFreeze() {
  const mutation = useMutation({
    mutationKey: ['equity', 'freeze'],
    mutationFn: async ({
      pincode,
      from,
      address,
      userAddress,
      amount,
    }: Freeze) => {
      const { decimals } = await getEquityDetail({ address });

      const response = await portalClient.request(EquityFreeze, {
        address: address,
        user: userAddress,
        from,
        amount: parseUnits(amount.toString(), decimals).toString(),
        challengeResponse: await handleChallenge(from, pincode),
      });

      return z.hash().parse(response.EquityFreeze?.transactionHash);
    },
  });

  return {
    ...mutation,
    inputSchema: FreezeSchema,
    outputSchema: z.hash(),
    invalidateKeys: () => [['user'], ['transaction'], ['asset']],
  };
}
