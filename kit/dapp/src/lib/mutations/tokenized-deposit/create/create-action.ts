'use server';

import { handleChallenge } from '@/lib/challenge';
import { TOKENIZED_DEPOSIT_FACTORY_ADDRESS } from '@/lib/contracts';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z } from '@/lib/utils/zod';
import { action } from '../../safe-action';
import { CreateTokenizedDepositSchema } from './create-schema';

/**
 * GraphQL mutation for creating a new stablecoin
 *
 * @remarks
 * Creates a new stablecoin contract through the stablecoin factory
 */
const TokenizedDepositFactoryCreate = portalGraphql(`
  mutation TokenizedDepositFactoryCreate($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $collateralLivenessSeconds: Float!) {
    TokenizedDepositFactoryCreate(
      address: $address
      from: $from
      input: { name: $name, symbol: $symbol, decimals: $decimals, collateralLivenessSeconds: $collateralLivenessSeconds}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for creating off-chain metadata for a stablecoin
 *
 * @remarks
 * Stores additional metadata about the stablecoin in Hasura
 */
const CreateOffchainTokenizedDeposit = hasuraGraphql(`
  mutation CreateOffchainStablecoin($id: String!, $isin: String) {
    insert_asset_one(object: {id: $id, isin: $isin}, on_conflict: {constraint: asset_pkey, update_columns: isin}) {
      id
    }
  }
`);

export const createTokenizedDeposit = action
  .schema(CreateTokenizedDepositSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: {
        assetName,
        symbol,
        decimals,
        collateralLivenessSeconds,
        pincode,
        isin,
        predictedAddress,
      },
      ctx: { user },
    }) => {
      await hasuraClient.request(CreateOffchainTokenizedDeposit, {
        id: predictedAddress,
        isin,
      });

      const data = await portalClient.request(TokenizedDepositFactoryCreate, {
        address: TOKENIZED_DEPOSIT_FACTORY_ADDRESS,
        from: user.wallet,
        name: assetName,
        symbol,
        decimals,
        collateralLivenessSeconds,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return z
        .hashes()
        .parse([data.TokenizedDepositFactoryCreate?.transactionHash]);
    }
  );
