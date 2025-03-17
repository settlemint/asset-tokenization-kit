'use server';
import { getUser } from '@/lib/auth/utils';
import { TOKENIZED_DEPOSIT_FACTORY_ADDRESS } from '@/lib/contracts';
import type { CreateTokenizedDepositInput } from '@/lib/mutations/tokenized-deposit/create/create-schema';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { safeParseWithLogging, z } from '@/lib/utils/zod';
import { cache } from 'react';
import type { Address } from 'viem';

/**
 * GraphQL query for predicting the address of a new stablecoin
 *
 * @remarks
 * Uses deterministic deployment to predict the contract address before creation
 */
const CreateTokenizedDepositPredictAddress = portalGraphql(`
  query CreateTokenizedDepositPredictAddress($address: String!, $sender: String!, $decimals: Int!, $name: String!, $symbol: String!, $collateralLivenessSeconds: Float!) {
    TokenizedDepositFactory(address: $address) {
      predictAddress(
        sender: $sender
        decimals: $decimals
        name: $name
        symbol: $symbol
        collateralLivenessSeconds: $collateralLivenessSeconds
      ) {
        predicted
      }
    }
  }
`);

const PredictedAddressSchema = z.object({
  TokenizedDepositFactory: z.object({
    predictAddress: z.object({
      predicted: z.address(),
    }),
  }),
});

/**
 * Predicts the address of a new stablecoin
 *
 * @param input - The data for creating a new stablecoin
 * @returns The predicted address of the new stablecoin
 */
export const getPredictedAddress = cache(
  async (input: CreateTokenizedDepositInput) => {
    const { assetName, symbol, decimals, collateralLivenessSeconds } = input;
    const user = await getUser();

    const data = await portalClient.request(
      CreateTokenizedDepositPredictAddress,
      {
        address: TOKENIZED_DEPOSIT_FACTORY_ADDRESS,
        sender: user.wallet as Address,
        decimals,
        name: assetName,
        symbol,
        collateralLivenessSeconds,
      }
    );

    const predictedAddress = safeParseWithLogging(
      PredictedAddressSchema,
      data,
      'tokenized deposit'
    );

    return predictedAddress.TokenizedDepositFactory.predictAddress.predicted;
  }
);
