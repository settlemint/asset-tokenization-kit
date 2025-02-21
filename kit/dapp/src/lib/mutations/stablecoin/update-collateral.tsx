import { handleChallenge } from '@/lib/challenge';
import { getStableCoinDetail } from '@/lib/queries/stablecoin/stablecoin-detail';
import { AddressSchema, AmountSchema, PincodeSchema, TransactionHashSchema } from '@/lib/schema';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { useMutation } from '@tanstack/react-query';
import { parseUnits } from 'viem';
import { z } from 'zod';

const UpdateCollateral = portalGraphql(`
  mutation UpdateCollateral(
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

export const UpdateCollateralSchema = z.object({
  address: AddressSchema,
  amount: AmountSchema,
  pincode: PincodeSchema,
  from: AddressSchema,
});

export type UpdateCollateral = z.infer<typeof UpdateCollateralSchema>;

export function useUpdateCollateral() {
  const mutation = useMutation({
    mutationFn: async ({ amount, pincode, from, address }: z.infer<typeof UpdateCollateralSchema>) => {
      const { decimals } = await getStableCoinDetail({ address });

      const response = await portalClient.request(UpdateCollateral, {
        address: address,
        from,
        amount: parseUnits(amount.toString(), decimals).toString(),
        challengeResponse: await handleChallenge(from, pincode),
      });

      return TransactionHashSchema.parse(response.StableCoinUpdateCollateral?.transactionHash);
    },
  });

  return {
    ...mutation,
    inputSchema: UpdateCollateralSchema,
    outputSchema: TransactionHashSchema,
  };
}
