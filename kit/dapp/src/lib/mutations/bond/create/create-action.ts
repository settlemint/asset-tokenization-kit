'use server';

import { handleChallenge } from '@/lib/challenge';
import { BOND_FACTORY_ADDRESS } from '@/lib/contracts';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z } from '@/lib/utils/zod';
import { action } from '../../safe-action';
import { CreateBondSchema } from './create-schema';

/**
 * GraphQL mutation for creating a new bond
 *
 * @remarks
 * Creates a new bond contract through the bond factory
 */
const BondFactoryCreate = portalGraphql(`
  mutation BondFactoryCreate($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $isin: String!, $cap: String!, $maturityDate: String!, $faceValue: String!, $underlyingAsset: String!) {
    BondFactoryCreate(
      address: $address
      from: $from
      input: {name: $name, symbol: $symbol, decimals: $decimals, isin: $isin, cap: $cap, maturityDate: $maturityDate, faceValue: $faceValue, underlyingAsset: $underlyingAsset}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL query for predicting the address of a new bond
 *
 * @remarks
 * Uses deterministic deployment to predict the contract address before creation
 */
const CreateBondPredictAddress = portalGraphql(`
  query CreateBondPredictAddress($address: String!, $sender: String!, $decimals: Int!, $isin: String!, $name: String!, $symbol: String!, $cap: String!, $maturityDate: String!, $faceValue: String!, $underlyingAsset: String!) {
    BondFactory(address: $address) {
      predictAddress(
        sender: $sender
        decimals: $decimals
        name: $name
        symbol: $symbol
        isin: $isin
        cap: $cap
        maturityDate: $maturityDate
        faceValue: $faceValue
        underlyingAsset: $underlyingAsset
      ) {
        predicted
      }
    }
  }
`);

/**
 * GraphQL mutation for creating off-chain metadata for a bond
 *
 * @remarks
 * Stores additional metadata about the bond in Hasura
 */
const CreateOffchainBond = hasuraGraphql(`
  mutation CreateOffchainBond($id: String!, $private: Boolean!) {
    insert_asset_one(object: {id: $id, private: $private}, on_conflict: {constraint: asset_pkey, update_columns: private}) {
      id
    }
  }
`);

export const createBond = action
  .schema(CreateBondSchema)
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
        cap,
        maturityDate,
        faceValue,
        underlyingAsset,
      },
      ctx: { user },
    }) => {
      const predictedAddress = await portalClient.request(
        CreateBondPredictAddress,
        {
          address: BOND_FACTORY_ADDRESS,
          sender: user.wallet,
          decimals,
          isin: isin ?? '',
          name: assetName,
          symbol,
          cap,
          maturityDate,
          faceValue,
          underlyingAsset,
        }
      );

      const newAddress =
        predictedAddress.BondFactory?.predictAddress?.predicted;

      if (!newAddress) {
        throw new Error('Failed to predict the address');
      }

      await hasuraClient.request(CreateOffchainBond, {
        id: newAddress,
        private: privateAsset,
      });

      const data = await portalClient.request(BondFactoryCreate, {
        address: BOND_FACTORY_ADDRESS,
        from: user.wallet,
        name: assetName,
        symbol,
        decimals,
        isin: isin ?? '',
        cap,
        maturityDate,
        faceValue,
        underlyingAsset,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return z.hashes().parse([data.BondFactoryCreate?.transactionHash]);
    }
  );
