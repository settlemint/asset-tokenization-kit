'use server';

import { handleChallenge } from '@/lib/challenge';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { safeParseTransactionHash, z } from '@/lib/utils/zod';
import { action } from '../safe-action';
import { UnpauseSchema } from './unpause-schema';

/**
 * GraphQL mutation for unpausing a bond contract
 */
const BondUnpause = portalGraphql(`
  mutation BondUnpause($address: String!, $from: String!, $challengeResponse: String!) {
    BondUnpause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for unpausing an equity contract
 */
const EquityUnpause = portalGraphql(`
  mutation EquityUnpause($address: String!, $from: String!, $challengeResponse: String!) {
    EquityUnpause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for unpausing a fund contract
 */
const FundUnpause = portalGraphql(`
  mutation FundUnpause($address: String!, $from: String!, $challengeResponse: String!) {
    FundUnpause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for unpausing a stablecoin contract
 */
const StableCoinUnpause = portalGraphql(`
  mutation StableCoinUnpause($address: String!, $from: String!, $challengeResponse: String!) {
    StableCoinUnpause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for unpausing a tokenized deposit contract
 */
const TokenizedDepositUnpause = portalGraphql(`
  mutation TokenizedDepositUnpause($address: String!, $from: String!, $challengeResponse: String!) {
    TokenizedDepositUnpause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const unpause = action
  .schema(UnpauseSchema)
  .outputSchema(z.hashes())
  .action(
    async ({ parsedInput: { address, pincode, assettype }, ctx: { user } }) => {
      // Common parameters for all mutations
      const params = {
        address,
        from: user.wallet,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      };

      switch (assettype) {
        case 'bond': {
          const response = await portalClient.request(BondUnpause, params);
          return safeParseTransactionHash([
            response.BondUnpause?.transactionHash,
          ]);
        }
        case 'cryptocurrency': {
          throw new Error('Cryptocurrency does not support unpause operations');
        }
        case 'equity': {
          const response = await portalClient.request(EquityUnpause, params);
          return safeParseTransactionHash([
            response.EquityUnpause?.transactionHash,
          ]);
        }
        case 'fund': {
          const response = await portalClient.request(FundUnpause, params);
          return safeParseTransactionHash([
            response.FundUnpause?.transactionHash,
          ]);
        }
        case 'stablecoin': {
          const response = await portalClient.request(
            StableCoinUnpause,
            params
          );
          return z
            .hashes()
            .parse([response.StableCoinUnpause?.transactionHash]);
        }
        case 'tokenizeddeposit': {
          const response = await portalClient.request(
            TokenizedDepositUnpause,
            params
          );
          return z
            .hashes()
            .parse([response.TokenizedDepositUnpause?.transactionHash]);
        }
        default:
          throw new Error('Invalid asset type');
      }
    }
  );
