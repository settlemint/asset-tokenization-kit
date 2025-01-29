'use server';

import { CreateCryptoCurrencyOutputSchema } from '@/app/(private)/admin/cryptocurrencies/_components/create-form/schema';
import { getActiveOrganizationId, getAuthenticatedUser } from '@/lib/auth/auth';
import { handleChallenge } from '@/lib/challenge';
import { CRYPTO_CURRENCY_FACTORY_ADDRESS } from '@/lib/contracts';
import { actionClient } from '@/lib/safe-action';
import { portalGraphql } from '@/lib/settlemint/portal';
import { theGraphClientStarterkits } from '@/lib/settlemint/the-graph';
import type { Address } from 'viem';
import { parseUnits } from 'viem';
import { CreateCryptoCurrencyFormSchema } from './schema';

const CreateCryptocurrency = portalGraphql(`
  mutation CreateCryptocurrency($address: String!, $challengeResponse: String!, $from: String!, $gasLimit: String!, $decimals: Int!, $name: String!, $symbol: String!, $initialSupply: String!, $metadata: JSON!) {
    CryptoCurrencyFactoryCreate(
      address: $address
      from: $from
      input: {decimals: $decimals, initialSupply: $initialSupply, symbol: $symbol, name: $name}
      challengeResponse: $challengeResponse
      gasLimit: $gasLimit
      metadata: $metadata
    ) {
      transactionHash
    }
  }
`);

export const createCryptocurrency = actionClient
  .schema(CreateCryptoCurrencyFormSchema)
  .outputSchema(CreateCryptoCurrencyOutputSchema)
  .action(async ({ parsedInput: { assetName, symbol, decimals, pincode, initialSupply, private: isPrivate } }) => {
    const user = await getAuthenticatedUser();
    const organizationId = await getActiveOrganizationId();

    const data = await theGraphClientStarterkits.request(CreateCryptocurrency, {
      address: CRYPTO_CURRENCY_FACTORY_ADDRESS,
      from: user.wallet,
      name: assetName,
      symbol,
      decimals,
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
      gasLimit: '5000000',
      initialSupply: parseUnits(initialSupply.toString(), decimals).toString(),
      metadata: {
        private: isPrivate,
        organization: organizationId,
      },
    });

    const transactionHash = data.CryptoCurrencyFactoryCreate?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transaction to create the cryptocurrency');
    }

    return transactionHash;
  });
