'use server';

import { CreateEquityOutputSchema } from '@/app/(private)/admin/equities/_components/create-form/schema';
import { handleChallenge } from '@/lib/challenge';
import { EQUITY_FACTORY_ADDRESS } from '@/lib/contracts';
import { db } from '@/lib/db';
import { asset } from '@/lib/db/schema-asset-tokenization';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { CreateEquityFormSchema } from './schema';

const CreateEquity = portalGraphql(`
  mutation CreateEquity($address: String!, $challengeResponse: String!, $from: String!, $gasLimit: String!, $decimals: Int!, $equityCategory: String!, $equityClass: String!, $isin: String!, $name: String!, $symbol: String!) {
    EquityFactoryCreate(
      address: $address
      from: $from
      input: {decimals: $decimals, equityCategory: $equityCategory, equityClass: $equityClass, isin: $isin, name: $name, symbol: $symbol}
      challengeResponse: $challengeResponse
      gasLimit: $gasLimit
    ) {
      transactionHash
    }
  }
`);

const CreateEquityPredictAddress = portalGraphql(`
  query CreateEquityPredictAddress($address: String!, $sender: String!, $decimals: Int!, $equityCategory: String!, $equityClass: String!, $isin: String!, $name: String!, $symbol: String!) {
    EquityFactory(address: $address) {
      predictAddress(
        sender: $sender
        decimals: $decimals
        equityCategory: $equityCategory
        equityClass: $equityClass
        name: $name
        symbol: $symbol
        isin: $isin
      ) {
        predicted
      }
    }
  }
`);

export const createEquity = actionClient
  .schema(CreateEquityFormSchema)
  .outputSchema(CreateEquityOutputSchema)
  .action(
    async ({
      parsedInput: { assetName, symbol, decimals, pincode, isin, private: isPrivate, equityClass, equityCategory },
      ctx: { user },
    }) => {
      const predictedAddress = await portalClient.request(CreateEquityPredictAddress, {
        address: EQUITY_FACTORY_ADDRESS,
        sender: user.wallet,
        decimals,
        equityCategory,
        equityClass,
        isin: isin ?? '',
        name: assetName,
        symbol,
      });

      const address = predictedAddress.EquityFactory?.predictAddress?.predicted;

      if (!address) {
        throw new Error('Failed to predict the address');
      }

      await db.insert(asset).values({
        id: address,
        private: isPrivate,
      });

      const data = await portalClient.request(CreateEquity, {
        address: EQUITY_FACTORY_ADDRESS,
        from: user.wallet,
        name: assetName,
        symbol,
        decimals,
        isin,
        equityClass,
        equityCategory,
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
        gasLimit: '5000000',
      });

      const transactionHash = data.EquityFactoryCreate?.transactionHash;
      if (!transactionHash) {
        throw new Error('Failed to send the transaction to create the cryptocurrency');
      }

      return transactionHash;
    }
  );
