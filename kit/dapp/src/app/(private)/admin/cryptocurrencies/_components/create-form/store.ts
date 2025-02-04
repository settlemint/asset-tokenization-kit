'use server';

import { getAuthenticatedUser } from '@/lib/auth/auth';
import { handleChallenge } from '@/lib/challenge';
import { CRYPTO_CURRENCY_FACTORY_ADDRESS } from '@/lib/contracts';
import { db } from '@/lib/db';
import { asset } from '@/lib/db/schema-asset-tokenization';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { parseEther, parseUnits } from 'viem';
import { CreateCryptoCurrencyFormSchema, CreateCryptoCurrencyOutputSchema } from './schema';

const CreateCryptocurrency = portalGraphql(`
  mutation CreateCryptocurrency($address: String!, $challengeResponse: String!, $from: String!, $gasLimit: String!, $decimals: Int!, $name: String!, $symbol: String!, $initialSupply: String!) {
    CryptoCurrencyFactoryCreate(
      address: $address
      from: $from
      input: {decimals: $decimals, initialSupply: $initialSupply, symbol: $symbol, name: $name}
      challengeResponse: $challengeResponse
      gasLimit: $gasLimit
    ) {
      transactionHash
    }
  }
`);

const CreateCryptocurrencyPredictAddress = portalGraphql(`
  query CreateCryptocurrencyPredictAddress($address: String!, $sender: String!, $decimals: Int!, $name: String!, $symbol: String!, $initialSupply: String!) {
    CryptoCurrencyFactory(address: $address) {
      predictAddress(
        sender: $sender
        decimals: $decimals
        name: $name
        symbol: $symbol
        initialSupply: $initialSupply
      ) {
        predicted
      }
    }
  }
`);

export const createCryptocurrency = actionClient
  .schema(CreateCryptoCurrencyFormSchema)
  .outputSchema(CreateCryptoCurrencyOutputSchema)
  .action(async ({ parsedInput: { assetName, symbol, decimals, pincode, initialSupply, private: isPrivate } }) => {
    const user = await getAuthenticatedUser();

    const predictedAddress = await portalClient.request(CreateCryptocurrencyPredictAddress, {
      address: CRYPTO_CURRENCY_FACTORY_ADDRESS,
      sender: user.wallet,
      decimals,
      initialSupply: parseEther(initialSupply.toString()).toString(),
      name: assetName,
      symbol,
    });

    const address = predictedAddress.CryptoCurrencyFactory?.predictAddress?.predicted;

    if (!address) {
      throw new Error('Failed to predict the address');
    }

    await db.insert(asset).values({
      id: address,
      private: isPrivate,
    });

    const data = await portalClient.request(CreateCryptocurrency, {
      address: CRYPTO_CURRENCY_FACTORY_ADDRESS,
      from: user.wallet,
      name: assetName,
      symbol,
      decimals,
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
      gasLimit: '5000000',
      initialSupply: parseUnits(initialSupply.toString(), decimals).toString(),
    });

    const transactionHash = data.CryptoCurrencyFactoryCreate?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transaction to create the cryptocurrency');
    }

    return transactionHash;
  });
