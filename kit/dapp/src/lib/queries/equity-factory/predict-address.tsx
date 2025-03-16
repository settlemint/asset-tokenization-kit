'use server';
import { getUser } from '@/lib/auth/utils';
import { EQUITY_FACTORY_ADDRESS } from '@/lib/contracts';
import type { CreateEquityInput } from '@/lib/mutations/equity/create/create-schema';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { safeParseWithLogging, z } from '@/lib/utils/zod';
import { cache } from 'react';
import type { Address } from 'viem';

/**
 * GraphQL query for predicting the address of a new equity
 *
 * @remarks
 * Uses deterministic deployment to predict the contract address before creation
 */
const CreateEquityPredictAddress = portalGraphql(`
  query CreateEquityPredictAddress($address: String!, $sender: String!, $decimals: Int!, $name: String!, $symbol: String!, $equityCategory: String!, $equityClass: String!) {
    EquityFactory(address: $address) {
      predictAddress(
        sender: $sender
        decimals: $decimals
        name: $name
        symbol: $symbol
        equityCategory: $equityCategory
        equityClass: $equityClass
      ) {
        predicted
      }
    }
  }
`);

const PredictedAddressSchema = z.object({
  EquityFactory: z.object({
    predictAddress: z.object({
      predicted: z.address(),
    }),
  }),
});

/**
 * Predicts the address of a new equity
 *
 * @param input - The data for creating a new equity
 * @returns The predicted address of the new equity
 */
export const getPredictedAddress = cache(async (input: CreateEquityInput) => {
  const { assetName, symbol, decimals, equityCategory, equityClass } = input;
  const user = await getUser();

  const data = await portalClient.request(CreateEquityPredictAddress, {
    address: EQUITY_FACTORY_ADDRESS,
    sender: user.wallet as Address,
    decimals,
    name: assetName,
    symbol,
    equityCategory,
    equityClass,
  });

  const predictedAddress = safeParseWithLogging(
    PredictedAddressSchema,
    data,
    'equity'
  );

  return predictedAddress.EquityFactory.predictAddress.predicted;
});
