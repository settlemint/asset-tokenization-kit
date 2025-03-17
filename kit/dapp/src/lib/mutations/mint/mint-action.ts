'use server';

import { handleChallenge } from '@/lib/challenge';
import { getAssetDetail } from '@/lib/queries/asset-detail';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { safeParseTransactionHash, z } from '@/lib/utils/zod';
import { parseUnits } from 'viem';
import { action } from '../safe-action';
import { MintSchema } from './mint-schema';

/**
 * GraphQL mutation to mint new bond tokens
 */
const BondMint = portalGraphql(`
  mutation BondMint($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!) {
    BondMint(
      address: $address
      from: $from
      input: {amount: $amount, to: $to}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to mint new cryptocurrency tokens
 */
const CryptoCurrencyMint = portalGraphql(`
  mutation CryptoCurrencyMint($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!) {
    CryptoCurrencyMint(
      address: $address
      from: $from
      input: {amount: $amount, to: $to}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to mint new equity tokens
 */
const EquityMint = portalGraphql(`
  mutation EquityMint($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!) {
    EquityMint(
      address: $address
      from: $from
      input: {amount: $amount, to: $to}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to mint new fund tokens
 */
const FundMint = portalGraphql(`
  mutation FundMint($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!) {
    FundMint(
      address: $address
      from: $from
      input: {amount: $amount, to: $to}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to mint new stablecoin tokens
 */
const StableCoinMint = portalGraphql(`
  mutation StableCoinMint($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!) {
    StableCoinMint(
      address: $address
      from: $from
      input: {amount: $amount, to: $to}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to mint new tokenized deposit tokens
 */
const TokenizedDepositMint = portalGraphql(`
  mutation TokenizedDepositMint($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!) {
    TokenizedDepositMint(
      address: $address
      from: $from
      input: {amount: $amount, to: $to}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const mint = action
  .schema(MintSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, pincode, amount, to, assettype },
      ctx: { user },
    }) => {
      // Get token details based on asset type
      const { decimals } = await getAssetDetail({
        address,
        assettype,
      });

      // Common parameters for all mutations
      const params = {
        address,
        from: user.wallet,
        amount: parseUnits(amount.toString(), decimals).toString(),
        to,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      };

      switch (assettype) {
        case 'bond': {
          const response = await portalClient.request(BondMint, params);
          return safeParseTransactionHash([response.BondMint?.transactionHash]);
        }
        case 'cryptocurrency': {
          const response = await portalClient.request(
            CryptoCurrencyMint,
            params
          );
          return z
            .hashes()
            .parse([response.CryptoCurrencyMint?.transactionHash]);
        }
        case 'equity': {
          const response = await portalClient.request(EquityMint, params);
          return safeParseTransactionHash([
            response.EquityMint?.transactionHash,
          ]);
        }
        case 'fund': {
          const response = await portalClient.request(FundMint, params);
          return safeParseTransactionHash([response.FundMint?.transactionHash]);
        }
        case 'stablecoin': {
          const response = await portalClient.request(StableCoinMint, params);
          return safeParseTransactionHash([
            response.StableCoinMint?.transactionHash,
          ]);
        }
        case 'tokenizeddeposit': {
          const response = await portalClient.request(
            TokenizedDepositMint,
            params
          );
          return z
            .hashes()
            .parse([response.TokenizedDepositMint?.transactionHash]);
        }
        default:
          throw new Error('Invalid asset type');
      }
    }
  );
