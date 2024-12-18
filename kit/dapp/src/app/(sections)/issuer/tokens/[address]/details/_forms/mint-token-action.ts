'use server';

import { auth } from '@/lib/auth/auth';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { headers } from 'next/headers';
import { parseEther } from 'viem';
import { MintTokenSchema } from './mint-token-form-schema';

const MintTokenMutation = portalGraphql(`
mutation MintTokenMutation($address: String!, $from: String!, $to: String!, $amount: String!) {
  StarterKitERC20Mint(
    from: $from
    address: $address
    input: {amount: $amount, to: $to}
  ) {
    transactionHash
  }
}
`);

export const mintTokenAction = actionClient.schema(MintTokenSchema).action(async ({ parsedInput }) => {
  const { to, amount, tokenAddress } = parsedInput;
  const userSession = await auth.api.getSession({
    headers: await headers(),
  });

  if (!userSession?.user) {
    throw new Error('User not authenticated');
  }

  const result = await portalClient.request(MintTokenMutation, {
    address: tokenAddress,
    from: userSession.user.wallet,
    to: to,
    amount: parseEther(amount.toString()).toString(),
  });

  const transactionHash = result.StarterKitERC20Mint?.transactionHash;

  if (!transactionHash) {
    throw new Error('Transaction hash not found');
  }

  return transactionHash;
});
