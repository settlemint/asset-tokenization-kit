'use server';

import { getAuthenticatedUser } from '@/lib/auth/auth';
import {
  BOND_FACTORY_ADDRESS,
  CRYPTO_CURRENCY_FACTORY_ADDRESS,
  EQUITY_FACTORY_ADDRESS,
  STABLE_COIN_FACTORY_ADDRESS,
} from '@/lib/contracts';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { VariablesOf } from 'gql.tada';
import type { Address } from 'viem';
import { CreateTokenSchema } from './create-token-form-schema';
import { handleChallenge } from './lib/challenge';

// TODO: figure out why the portal cannot estimate the gas, i have to set it myself or it defaults to 90k
const StableCoinFactoryCreate = portalGraphql(`
  mutation StableCoinFactoryCreate($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $gasLimit: String!, $collateralLivenessSeconds: Int!, $isin: String!) {
    StableCoinFactoryCreate(
      address: $address
      from: $from
      input: {collateralLivenessSeconds: $collateralLivenessSeconds, name: $name, symbol: $symbol, decimals: $decimals, isin: $isin}
      gasLimit: $gasLimit
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

const BondFactoryCreate = portalGraphql(`
  mutation BondFactoryCreate($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $gasLimit: String!, $faceValue: String!, $isin: String!, $maturityDate: String!, $underlyingAsset: String!) {
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

const CryptoCurrencyFactoryCreate = portalGraphql(`
  mutation CryptoCurrencyFactoryCreate($address: String!, $challengeResponse: String!, $from: String!, $gasLimit: String!, $decimals: Int!, $name: String!, $symbol: String!, $initialSupply: String!) {
    CryptoCurrencyFactoryCreate(
      address: $address
      from: $from
      input: {decimals: $decimals, initialSupply: $initialSupply, symbol: $symbol, name: $name}
      challengeResponse: $challengeResponse
      gasLimit: $gasLimit
    ) {
      transactionHash
    }
  }
`);

const EquityFactoryCreate = portalGraphql(`
  mutation EquityFactoryCreate($address: String!, $challengeResponse: String!, $from: String!, $gasLimit: String!, $decimals: Int!, $equityCategory: String!, $equityClass: String!, $isin: String!, $name: String!, $symbol: String!) {
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

export const createTokenAction = actionClient.schema(CreateTokenSchema).action(async ({ parsedInput }) => {
  try {
    const { tokenType, tokenName, tokenSymbol, pincode, decimals, isin } = parsedInput;
    const user = await getAuthenticatedUser();

    const commonVariables = {
      from: user.wallet,
      name: tokenName,
      symbol: tokenSymbol,
      decimals,
      isin: isin || '',
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
      gasLimit: '5000000',
    };

    switch (tokenType) {
      case 'stablecoin': {
        const variables: VariablesOf<typeof StableCoinFactoryCreate> = {
          ...commonVariables,
          address: STABLE_COIN_FACTORY_ADDRESS,
          collateralLivenessSeconds: parsedInput.collateralProofValidityDuration,
        };
        const response = await portalClient.request(StableCoinFactoryCreate, variables);
        if (!response?.StableCoinFactoryCreate?.transactionHash) {
          throw new Error('Transaction hash not found');
        }
        return response.StableCoinFactoryCreate.transactionHash;
      }
      case 'bond': {
        const variables: VariablesOf<typeof BondFactoryCreate> = {
          ...commonVariables,
          address: BOND_FACTORY_ADDRESS,
          faceValue: parsedInput.faceValue.toString(),
          maturityDate: parsedInput.maturityDate.toISOString(),
          underlyingAsset: parsedInput.faceValueCurrency,
        };
        const response = await portalClient.request(BondFactoryCreate, variables);
        if (!response?.BondFactoryCreate?.transactionHash) {
          throw new Error('Transaction hash not found');
        }
        return response.BondFactoryCreate.transactionHash;
      }
      case 'cryptocurrency': {
        const variables: VariablesOf<typeof CryptoCurrencyFactoryCreate> = {
          ...commonVariables,
          address: CRYPTO_CURRENCY_FACTORY_ADDRESS,
          initialSupply: '0', // Initial supply is always 0 for now
        };
        const response = await portalClient.request(CryptoCurrencyFactoryCreate, variables);
        if (!response?.CryptoCurrencyFactoryCreate?.transactionHash) {
          throw new Error('Transaction hash not found');
        }
        return response.CryptoCurrencyFactoryCreate.transactionHash;
      }
      case 'equity': {
        const variables: VariablesOf<typeof EquityFactoryCreate> = {
          ...commonVariables,
          address: EQUITY_FACTORY_ADDRESS,
          equityCategory: parsedInput.equityCategory,
          equityClass: parsedInput.equityClass,
        };
        const response = await portalClient.request(EquityFactoryCreate, variables);
        if (!response?.EquityFactoryCreate?.transactionHash) {
          throw new Error('Transaction hash not found');
        }
        return response.EquityFactoryCreate.transactionHash;
      }
      default: {
        throw new Error('Invalid token type');
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '';
    throw new Error(`Error creating token ${errorMessage ? `: ${errorMessage}` : ''}`);
  }
});
