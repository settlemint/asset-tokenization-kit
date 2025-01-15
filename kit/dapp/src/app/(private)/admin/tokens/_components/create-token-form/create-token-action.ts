'use server';

import { auth } from '@/lib/auth/auth';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { ResultOf } from 'gql.tada';
import { headers } from 'next/headers';
import { CreateTokenSchema } from './create-token-form-schema';

// TODO: figure out why the portal cannot estimate the gas, i have to set it myself or it defaults to 90k
const CreateTokenMutation = portalGraphql(`
mutation CreateTokenMutation($address: String!, $from: String!, $name: String!, $symbol: String!) {
  StableCoinFactoryCreate(
    address: $address
    from: $from
    input: {collateralLivenessSeconds: 3600, name: $name, symbol: $symbol}
    gasLimit: "2000000"
  ) {
    transactionHash
  }
}
`);

type CreateTokenMutationResponse = ResultOf<typeof CreateTokenMutation>;

export const createTokenAction = actionClient.schema(CreateTokenSchema).action(async ({ parsedInput }) => {
  const { tokenName, tokenSymbol } = parsedInput;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  let result: CreateTokenMutationResponse | null = null;
  try {
    result = await portalClient.request(CreateTokenMutation, {
      address: process.env.SETTLEMINT_PREDEPLOYED_CONTRACT_ERC20_FACTORY!,
      from: session.user.wallet,
      name: tokenName,
      symbol: tokenSymbol,
    });
  } catch (error) {
    console.error('SUBMIT error', error);
  }

  const transactionHash = result?.StableCoinFactoryCreate?.transactionHash;

  if (!transactionHash) {
    throw new Error('Transaction hash not found');
  }

  return transactionHash;
});
