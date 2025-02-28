'use server';

import { handleChallenge } from '@/lib/challenge';
import { FUND_FACTORY_ADDRESS } from '@/lib/contracts';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z } from '@/lib/utils/zod';
import { action } from '../../safe-action';
import { CreateFundSchema } from './create-schema';

/**
 * GraphQL mutation for creating a new fund
 *
 * @remarks
 * Creates a new fund contract through the fund factory
 */
const FundFactoryCreate = portalGraphql(`
  mutation FundFactoryCreate($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $isin: String!, $fundCategory: String!, $fundClass: String!, $managementFeeBps: Int!) {
    FundFactoryCreate(
      address: $address
      from: $from
      input: {name: $name, symbol: $symbol, decimals: $decimals, isin: $isin, fundCategory: $fundCategory, fundClass: $fundClass, managementFeeBps: $managementFeeBps}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL query for predicting the address of a new fund
 *
 * @remarks
 * Uses deterministic deployment to predict the contract address before creation
 */
const CreateFundPredictAddress = portalGraphql(`
  query CreateFundPredictAddress($address: String!, $sender: String!, $decimals: Int!, $isin: String!, $name: String!, $symbol: String!, $fundCategory: String!, $fundClass: String!, $managementFeeBps: Int!) {
    FundFactory(address: $address) {
      predictAddress(
        sender: $sender
        decimals: $decimals
        name: $name
        symbol: $symbol
        isin: $isin
        fundCategory: $fundCategory
        fundClass: $fundClass
        managementFeeBps: $managementFeeBps
      ) {
        predicted
      }
    }
  }
`);

/**
 * GraphQL mutation for creating off-chain metadata for a fund
 *
 * @remarks
 * Stores additional metadata about the fund in Hasura
 */
const CreateOffchainFund = hasuraGraphql(`
  mutation CreateOffchainFund($id: String!, $private: Boolean!) {
    insert_asset_one(object: {id: $id, private: $private}, on_conflict: {constraint: asset_pkey, update_columns: private}) {
      id
    }
  }
`);

export const createFund = action
  .schema(CreateFundSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: {
        assetName,
        symbol,
        decimals,
        pincode,
        isin,
        privateAsset,
        fundCategory,
        fundClass,
        managementFeeBps,
      },
      ctx: { user },
    }) => {
      const predictedAddress = await portalClient.request(
        CreateFundPredictAddress,
        {
          address: FUND_FACTORY_ADDRESS,
          sender: user.wallet,
          decimals,
          isin: isin ?? '',
          name: assetName,
          symbol,
          fundCategory,
          fundClass,
          managementFeeBps,
        }
      );

      const newAddress =
        predictedAddress.FundFactory?.predictAddress?.predicted;

      if (!newAddress) {
        throw new Error('Failed to predict the address');
      }

      await hasuraClient.request(CreateOffchainFund, {
        id: newAddress,
        private: privateAsset,
      });

      const data = await portalClient.request(FundFactoryCreate, {
        address: FUND_FACTORY_ADDRESS,
        from: user.wallet,
        name: assetName,
        symbol,
        decimals,
        isin: isin ?? '',
        fundCategory,
        fundClass,
        managementFeeBps,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return z.hashes().parse([data.FundFactoryCreate?.transactionHash]);
    }
  );
