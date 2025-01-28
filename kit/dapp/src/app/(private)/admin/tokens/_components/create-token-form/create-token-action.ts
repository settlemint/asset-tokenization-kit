'use server';

import { getAuthenticatedUser } from '@/lib/auth/auth';
import {
  BOND_FACTORY_ADDRESS,
  CRYPTO_CURRENCY_FACTORY_ADDRESS,
  EQUITY_FACTORY_ADDRESS,
  STABLE_COIN_FACTORY_ADDRESS,
} from '@/lib/contracts';
import { revalidateTags } from '@/lib/revalidateTags';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { TokenTypeValue } from '@/types/token-types';
import type { VariablesOf } from 'gql.tada';
import type { Address } from 'viem';
import { ASSETS_SUPPLY_QUERY_KEY } from '../../../(dashboard)/_components/dashboard-metrics/assets-supply/consts';
import { TRANSACTIONS_QUERY_KEY } from '../../../(dashboard)/_components/dashboard-metrics/transactions/consts';
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

/**
 * Helper function to handle the common pattern of getting transaction hash and revalidating
 */
const handleFactoryResponse = (response: { transactionHash: string | null } | null, tokenType: TokenTypeValue) => {
  if (!response?.transactionHash) {
    throw new Error('Transaction hash not found');
  }
  revalidateTags([tokenType, ASSETS_SUPPLY_QUERY_KEY, TRANSACTIONS_QUERY_KEY]);
  return response.transactionHash;
};

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
        return handleFactoryResponse(response?.StableCoinFactoryCreate, tokenType);
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
        return handleFactoryResponse(response?.BondFactoryCreate, tokenType);
      }
      case 'cryptocurrency': {
        const variables: VariablesOf<typeof CryptoCurrencyFactoryCreate> = {
          ...commonVariables,
          address: CRYPTO_CURRENCY_FACTORY_ADDRESS,
          initialSupply: '0', // Initial supply is always 0 for now
        };
        const response = await portalClient.request(CryptoCurrencyFactoryCreate, variables);
        return handleFactoryResponse(response?.CryptoCurrencyFactoryCreate, tokenType);
      }
      case 'equity': {
        const variables: VariablesOf<typeof EquityFactoryCreate> = {
          ...commonVariables,
          address: EQUITY_FACTORY_ADDRESS,
          equityCategory: parsedInput.equityCategory,
          equityClass: parsedInput.equityClass,
        };
        const response = await portalClient.request(EquityFactoryCreate, variables);
        return handleFactoryResponse(response?.EquityFactoryCreate, tokenType);
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
