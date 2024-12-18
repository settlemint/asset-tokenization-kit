'use server';

import { auth } from '@/lib/auth/auth';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { headers } from 'next/headers';
import { parseEther } from 'viem';
import { StakeTokenSchema } from './stake-token-form-schema';

const AddLiquidityMutation = portalGraphql(`
mutation AddLiquidity($address: String!, $from: String!, $baseAmount: String!, $quoteAmount: String!) {
  StarterKitERC20DexAddLiquidity(
    address: $address
    from: $from
    input: {baseAmount: $baseAmount, quoteAmount: $quoteAmount}
    gasLimit: "2000000"
  ) {
    transactionHash
  }
}
`);

export const stakeTokenAction = actionClient.schema(StakeTokenSchema).action(async ({ parsedInput }) => {
  const { quoteAmount, baseAmount, tokenAddress } = parsedInput;
  const userSession = await auth.api.getSession({
    headers: await headers(),
  });

  if (!userSession?.user) {
    throw new Error('User not authenticated');
  }

  const result = await portalClient.request(AddLiquidityMutation, {
    address: tokenAddress,
    from: userSession.user.wallet,
    baseAmount: parseEther(baseAmount.toString()).toString(),
    quoteAmount: parseEther(quoteAmount.toString()).toString(),
  });

  const transactionHash = result.StarterKitERC20DexAddLiquidity?.transactionHash;

  if (!transactionHash) {
    throw new Error('Transaction hash not found');
  }

  return transactionHash;
});
