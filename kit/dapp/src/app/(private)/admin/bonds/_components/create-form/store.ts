'use server';

import { CreateBondOutputSchema } from '@/app/(private)/admin/bonds/_components/create-form/schema';
import { getActiveOrganizationId, getAuthenticatedUser } from '@/lib/auth/auth';
import { handleChallenge } from '@/lib/challenge';
import { CRYPTO_CURRENCY_FACTORY_ADDRESS } from '@/lib/contracts';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { CreateBondFormSchema } from './schema';

const CreateBond = portalGraphql(`
   mutation CreateBond($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $gasLimit: String!, $faceValue: String!, $isin: String!, $maturityDate: String!, $underlyingAsset: String!) {
    BondFactoryCreate(
      from: $from
      input: {decimals: $decimals, faceValue: $faceValue, isin: $isin, maturityDate: $maturityDate, name: $name, symbol: $symbol, underlyingAsset: $underlyingAsset}
      challengeResponse: $challengeResponse
      address: $address
      gasLimit: $gasLimit
    ) {
      transactionHash
    }
  }
`);

export const createBond = actionClient
  .schema(CreateBondFormSchema)
  .outputSchema(CreateBondOutputSchema)
  .action(
    async ({
      parsedInput: {
        assetName,
        symbol,
        decimals,
        pincode,
        isin,
        private: isPrivate,
        faceValueCurrency,
        faceValue,
        maturityDate,
        couponRate,
        paymentFrequency,
        firstCouponDate,
      },
    }) => {
      const user = await getAuthenticatedUser();
      const organizationId = await getActiveOrganizationId();

      const data = await portalClient.request(CreateBond, {
        address: CRYPTO_CURRENCY_FACTORY_ADDRESS,
        from: user.wallet,
        name: assetName,
        symbol,
        decimals,
        isin,
        faceValue,
        maturityDate: maturityDate.toISOString(),
        underlyingAsset: '',
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
        gasLimit: '5000000',
      });

      const transactionHash = data.BondFactoryCreate?.transactionHash;
      if (!transactionHash) {
        throw new Error('Failed to send the transaction to create the cryptocurrency');
      }

      return transactionHash;
    }
  );
