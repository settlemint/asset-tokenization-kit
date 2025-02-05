'use server';

import { CreateBondOutputSchema } from '@/app/(private)/admin/bonds/_components/create-form/schema';
import { getAuthenticatedUser } from '@/lib/auth/auth';
import { handleChallenge } from '@/lib/challenge';
import { BOND_FACTORY_ADDRESS } from '@/lib/contracts';
import { db } from '@/lib/db';
import { asset } from '@/lib/db/schema-asset-tokenization';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { type Address, parseEther } from 'viem';
import { CreateBondFormSchema } from './schema';

const CreateBond = portalGraphql(`
   mutation CreateBond($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $gasLimit: String!, $faceValue: String!, $isin: String!, $maturityDate: String!, $underlyingAsset: String!, $cap: String!) {
    BondFactoryCreate(
      from: $from
      input: {decimals: $decimals, faceValue: $faceValue, isin: $isin, maturityDate: $maturityDate, name: $name, symbol: $symbol, underlyingAsset: $underlyingAsset, cap: $cap}
      challengeResponse: $challengeResponse
      address: $address
      gasLimit: $gasLimit
    ) {
      transactionHash
    }
  }
`);

const CreateBondPredictAddress = portalGraphql(`
  query CreateBondPredictAddress($address: String!, $sender: String!, $decimals: Int!, $faceValue: String!, $maturityDate: String!, $underlyingAsset: String!, $cap: String!, $name: String!, $symbol: String!, $isin: String!) {
    BondFactory(address: $address) {
      predictAddress(
        sender: $sender
        decimals: $decimals
        faceValue: $faceValue
        maturityDate: $maturityDate
        underlyingAsset: $underlyingAsset
        cap: $cap
        name: $name
        symbol: $symbol
        isin: $isin
      ){
        predicted
      }
    }
  }
`);

export const createBond = actionClient
  .schema(CreateBondFormSchema)
  .outputSchema(CreateBondOutputSchema)
  .action(
    async ({
      parsedInput: { assetName, symbol, decimals, pincode, isin, private: isPrivate, faceValue, maturityDate, cap },
    }) => {
      const user = await getAuthenticatedUser();

      const predictedAddress = await portalClient.request(CreateBondPredictAddress, {
        address: BOND_FACTORY_ADDRESS,
        sender: user.wallet,
        decimals,
        faceValue: parseEther(faceValue.toString()).toString(),
        maturityDate: maturityDate.toISOString(),
        underlyingAsset: '',
        cap: cap ? parseEther(cap.toString()).toString() : '0',
        name: assetName,
        symbol,
        isin: isin ?? '',
      });

      const address = predictedAddress.BondFactory?.predictAddress?.predicted;

      if (!address) {
        throw new Error('Failed to predict the address');
      }

      await db.insert(asset).values({
        id: address,
        private: isPrivate,
      });

      const data = await portalClient.request(CreateBond, {
        address: BOND_FACTORY_ADDRESS,
        from: user.wallet,
        name: assetName,
        symbol,
        decimals,
        isin: isin ?? '',
        faceValue: parseEther(faceValue.toString()).toString(),
        maturityDate: maturityDate.toISOString(),
        underlyingAsset: '',
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
        gasLimit: '5000000',
        cap: cap ? parseEther(cap.toString()).toString() : '0',
      });

      const transactionHash = data.BondFactoryCreate?.transactionHash;
      if (!transactionHash) {
        throw new Error('Failed to send the transaction to create the cryptocurrency');
      }

      return transactionHash;
    }
  );
