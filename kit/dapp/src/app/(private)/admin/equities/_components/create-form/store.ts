'use server';

import { CreateEquityOutputSchema } from '@/app/(private)/admin/equities/_components/create-form/schema';
import { getActiveOrganizationId, getAuthenticatedUser } from '@/lib/auth/auth';
import { handleChallenge } from '@/lib/challenge';
import { EQUITY_FACTORY_ADDRESS } from '@/lib/contracts';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { CreateEquityFormSchema } from './schema';

const CreateEquity = portalGraphql(`
  mutation CreateEquity($address: String!, $challengeResponse: String!, $from: String!, $gasLimit: String!, $decimals: Int!, $equityCategory: String!, $equityClass: String!, $isin: String!, $name: String!, $symbol: String!) {
    EquityFactoryCreate(
      address: $address
      from: $from
      input: {decimals: $decimals, equityCategory: $equityCategory, equityClass: $equityClass, isin: $isin, name: $name, symbol: $symbol}
      challengeResponse: $challengeResponse
      gasLimit: $gasLimit
    ) {
      transactionHash
    }
  }
`);

export const createEquity = actionClient
  .schema(CreateEquityFormSchema)
  .outputSchema(CreateEquityOutputSchema)
  .action(
    async ({
      parsedInput: { assetName, symbol, decimals, pincode, isin, private: isPrivate, equityClass, equityCategory },
    }) => {
      const user = await getAuthenticatedUser();
      const organizationId = await getActiveOrganizationId();

      const data = await portalClient.request(CreateEquity, {
        address: EQUITY_FACTORY_ADDRESS,
        from: user.wallet,
        name: assetName,
        symbol,
        decimals,
        isin,
        equityClass,
        equityCategory,
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
        gasLimit: '5000000',
        metadata: {
          private: isPrivate,
          organization: organizationId,
        },
      });

      const transactionHash = data.EquityFactoryCreate?.transactionHash;
      if (!transactionHash) {
        throw new Error('Failed to send the transaction to create the cryptocurrency');
      }

      return transactionHash;
    }
  );
