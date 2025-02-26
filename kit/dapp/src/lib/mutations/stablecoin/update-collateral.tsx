import { handleChallenge } from '@/lib/challenge';
import { getStableCoinDetail } from '@/lib/queries/stablecoin/stablecoin-detail';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z, type ZodInfer } from '@/lib/utils/zod';
import { useMutation } from '@tanstack/react-query';
import { parseUnits } from 'viem';

/**
 * GraphQL mutation to update the collateral amount for a stablecoin
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const StableCoinUpdateCollateral = portalGraphql(`
  mutation StableCoinUpdateCollateral(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $amount: String!
  ) {
    StableCoinUpdateCollateral(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      input: {amount: $amount}
      simulate: false
    ) {
      transactionHash
    }
  }
`);

/**
 * Zod schema for validating update collateral mutation inputs
 *
 * @property {string} address - The stablecoin contract address
 * @property {number} amount - The collateral amount to update
 * @property {string} pincode - User's pincode for authentication
 * @property {string} from - The sender's wallet address
 */
export const UpdateCollateralSchema = z.object({
  address: z.address(),
  amount: z.amount(),
  pincode: z.pincode(),
  from: z.address(),
});

/**
 * Type definition for update collateral mutation parameters
 */
export type UpdateCollateral = ZodInfer<typeof UpdateCollateralSchema>;

/**
 * Hook for updating the collateral amount of a stablecoin
 *
 * @returns A mutation object with methods to trigger the update collateral operation
 *
 * @example
 * ```tsx
 * const updateCollateralMutation = useUpdateCollateral();
 *
 * // Later in your code
 * updateCollateralMutation.mutate({
 *   address: "0x...",
 *   amount: 100,
 *   pincode: "123456",
 *   from: "0x..."
 * });
 * ```
 */
export function useUpdateCollateral() {
  const mutation = useMutation({
    mutationKey: ['stablecoin', 'update-collateral'],
    mutationFn: async ({
      amount,
      pincode,
      from,
      address,
    }: UpdateCollateral) => {
      const { decimals } = await getStableCoinDetail({ address });

      const response = await portalClient.request(StableCoinUpdateCollateral, {
        address: address,
        from,
        amount: parseUnits(amount.toString(), decimals).toString(),
        challengeResponse: await handleChallenge(from, pincode),
      });

      return z
        .hash()
        .parse(response.StableCoinUpdateCollateral?.transactionHash);
    },
  });

  return {
    ...mutation,
    inputSchema: UpdateCollateralSchema,
    outputSchema: z.hash(),
    invalidateKeys: () => [['user'], ['transaction'], ['asset']],
  };
}
