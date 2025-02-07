'use server';
import { handleChallenge } from '@/lib/challenge';
import { FUND_FACTORY_ADDRESS } from '@/lib/contracts';
import { db } from '@/lib/db';
import { asset } from '@/lib/db/schema-asset-tokenization';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { CreateFundFormSchema, CreateFundOutputSchema } from './schema';

const CreateFund = portalGraphql(`
  mutation CreateFund($address: String!, $challengeResponse: String!, $from: String!, $gasLimit: String!, $decimals: Int!, $fundCategory: String!, $fundClass: String!, $isin: String!, $name: String!, $symbol: String!, $managementFeeBps: Int!) {
    FundFactoryCreate(
      address: $address
      from: $from
      input: {decimals: $decimals, fundCategory: $fundCategory, fundClass: $fundClass, isin: $isin, name: $name, symbol: $symbol, managementFeeBps: $managementFeeBps}
      challengeResponse: $challengeResponse
      gasLimit: $gasLimit
    ) {
      transactionHash
    }
  }
`);

const CreateFundPredictAddress = portalGraphql(`
  query CreateFundPredictAddress($address: String!, $sender: String!, $decimals: Int!, $fundCategory: String!, $fundClass: String!, $managementFeeBps: Int!, $isin: String!, $name: String!, $symbol: String!) {
    FundFactory(address: $address) {
      predictAddress(
        sender: $sender
        decimals: $decimals
        fundCategory: $fundCategory
        fundClass: $fundClass
        managementFeeBps: $managementFeeBps
        name: $name
        symbol: $symbol
        isin: $isin
      ) {
        predicted
      }
    }
  }
`);

export const createFund = actionClient
  .schema(CreateFundFormSchema)
  .outputSchema(CreateFundOutputSchema)
  .action(
    async ({
      parsedInput: {
        assetName,
        symbol,
        decimals,
        pincode,
        isin,
        private: isPrivate,
        fundClass,
        fundCategory,
        managementFeeBps,
      },
      ctx: { user },
    }) => {
      const predictedAddress = await portalClient.request(CreateFundPredictAddress, {
        address: FUND_FACTORY_ADDRESS,
        sender: user.wallet,
        decimals,
        fundCategory,
        fundClass,
        isin: isin ?? '',
        managementFeeBps,
        name: assetName,
        symbol,
      });

      const address = predictedAddress.FundFactory?.predictAddress?.predicted;

      if (!address) {
        throw new Error('Failed to predict the address');
      }

      await db.insert(asset).values({
        id: address,
        private: isPrivate,
      });

      const data = await portalClient.request(CreateFund, {
        address: FUND_FACTORY_ADDRESS,
        from: user.wallet,
        name: assetName,
        symbol,
        decimals,
        isin: isin ?? '',
        fundClass,
        fundCategory,
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
        gasLimit: '5000000',
        managementFeeBps,
      });

      const transactionHash = data.FundFactoryCreate?.transactionHash;
      if (!transactionHash) {
        throw new Error('Failed to send the transaction to create the cryptocurrency');
      }

      return transactionHash;
    }
  );
