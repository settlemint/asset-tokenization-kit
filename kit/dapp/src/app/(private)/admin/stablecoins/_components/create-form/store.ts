'use server';
import { handleChallenge } from '@/lib/challenge';
import { STABLE_COIN_FACTORY_ADDRESS } from '@/lib/contracts';
import { convertDurationToSeconds } from '@/lib/date';
import { db } from '@/lib/db';
import { asset } from '@/lib/db/schema-asset-tokenization';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { CreateStablecoinFormSchema, CreateStablecoinOutputSchema } from './schema';

const CreateStablecoin = portalGraphql(`
  mutation CreateStableCoin($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $gasLimit: String!, $collateralLivenessSeconds: Float!, $isin: String!) {
    StableCoinFactoryCreate(
      address: $address
      from: $from
      input: {collateralLivenessSeconds: $collateralLivenessSeconds, name: $name, symbol: $symbol, decimals: $decimals, isin: $isin}
      gasLimit: $gasLimit
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

const CreateStablecoinPredictAddress = portalGraphql(`
  query CreateStablecoinPredictAddress($address: String!, $sender: String!, $decimals: Int!, $isin: String!, $name: String!, $symbol: String!, $collateralLivenessSeconds: Float!) {
    StableCoinFactory(address: $address) {
      predictAddress(
        sender: $sender
        decimals: $decimals
        collateralLivenessSeconds: $collateralLivenessSeconds
        name: $name
        symbol: $symbol
        isin: $isin
      ) {
        predicted
      }
    }
  }
`);

export const createStablecoin = actionClient
  .schema(CreateStablecoinFormSchema)
  .outputSchema(CreateStablecoinOutputSchema)
  .action(
    async ({
      parsedInput: { assetName, symbol, decimals, pincode, isin, private: isPrivate, collateralProofValidityDuration },
      ctx: { user },
    }) => {
      const predictedAddress = await portalClient.request(CreateStablecoinPredictAddress, {
        address: STABLE_COIN_FACTORY_ADDRESS,
        sender: user.wallet,
        decimals,
        isin: isin ?? '',
        collateralLivenessSeconds: convertDurationToSeconds(collateralProofValidityDuration),
        name: assetName,
        symbol,
      });

      const address = predictedAddress.StableCoinFactory?.predictAddress?.predicted;

      if (!address) {
        throw new Error('Failed to predict the address');
      }

      await db.insert(asset).values({
        id: address,
        private: isPrivate,
      });

      const data = await portalClient.request(CreateStablecoin, {
        address: STABLE_COIN_FACTORY_ADDRESS,
        from: user.wallet,
        name: assetName,
        symbol,
        decimals,
        isin: isin ?? '',
        collateralLivenessSeconds: convertDurationToSeconds(collateralProofValidityDuration),
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
        gasLimit: '5000000',
        metadata: {
          private: isPrivate,
        },
      });

      const transactionHash = data.StableCoinFactoryCreate?.transactionHash;
      if (!transactionHash) {
        throw new Error('Failed to send the transaction to create the cryptocurrency');
      }

      return transactionHash;
    }
  );
