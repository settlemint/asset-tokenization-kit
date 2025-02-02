'use server';

import {} from '@/app/(private)/admin/equities/_components/create-form/schema';
import { getActiveOrganizationId, getAuthenticatedUser } from '@/lib/auth/auth';
import { handleChallenge } from '@/lib/challenge';
import { FUND_FACTORY_ADDRESS } from '@/lib/contracts';
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
  query CreateFundPredictAddress($address: String!, $decimals: Int!, $fundCategory: String!, $fundClass: String!, $managementFeeBps: Int!, $isin: String!, $name: String!, $symbol: String!) {
    FundFactory(address: $address) {
      predictAddress(
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
    }) => {
      const user = await getAuthenticatedUser();
      const organizationId = await getActiveOrganizationId();

      const predictedAddress = await portalClient.request(CreateFundPredictAddress, {
        address: FUND_FACTORY_ADDRESS,
        decimals,
        fundCategory,
        fundClass,
        isin: isin ?? '',
        managementFeeBps,
        name: assetName,
        symbol,
      });

      console.log(predictedAddress);

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
        metadata: {
          private: isPrivate,
          organization: organizationId,
          predictedAddress: predictedAddress.FundFactory?.predictAddress?.predicted,
        },
      });

      const transactionHash = data.FundFactoryCreate?.transactionHash;
      if (!transactionHash) {
        throw new Error('Failed to send the transaction to create the cryptocurrency');
      }

      return transactionHash;
    }
  );
