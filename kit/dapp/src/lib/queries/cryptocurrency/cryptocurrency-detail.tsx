import { assetConfig } from '@/lib/config/assets';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getAddress, type Address } from 'viem';
import {
  CryptoCurrencyFragment,
  CryptoCurrencyFragmentSchema,
  OffchainCryptoCurrencyFragment,
  OffchainCryptoCurrencyFragmentSchema,
} from './cryptocurrency-fragment';

/**
 * GraphQL query to fetch on-chain cryptocurrency details from The Graph
 */
const CryptoCurrencyDetail = theGraphGraphqlStarterkits(
  `
  query CryptoCurrencyDetail($id: ID!) {
    cryptoCurrency(id: $id) {
      ...CryptoCurrencyFragment
    }
  }
`,
  [CryptoCurrencyFragment]
);

/**
 * GraphQL query to fetch off-chain cryptocurrency details from Hasura
 */
const OffchainCryptoCurrencyDetail = hasuraGraphql(
  `
  query OffchainCryptoCurrencyDetail($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
        ...OffchainCryptoCurrencyFragment
    }
  }
`,
  [OffchainCryptoCurrencyFragment]
);

/**
 * Props interface for cryptocurrency detail components
 */
export interface CryptoCurrencyDetailProps {
  /** Ethereum address of the cryptocurrency contract */
  address: Address;
}

/**
 * Fetches and combines on-chain and off-chain cryptocurrency data
 *
 * @param params - Object containing the cryptocurrency address
 * @returns Combined cryptocurrency data with additional calculated metrics
 * @throws Error if fetching or parsing fails
 */
export async function getCryptoCurrencyDetail({
  address,
}: CryptoCurrencyDetailProps) {
  try {
    const normalizedAddress = getAddress(address);

    const [data, dbCryptoCurrency] = await Promise.all([
      theGraphClientStarterkits.request(CryptoCurrencyDetail, { id: address }),
      hasuraClient.request(OffchainCryptoCurrencyDetail, {
        id: normalizedAddress,
      }),
    ]);

    const cryptocurrency = safeParseWithLogging(
      CryptoCurrencyFragmentSchema,
      data.cryptoCurrency,
      'cryptocurrency'
    );
    const offchainCryptoCurrency = dbCryptoCurrency.asset[0]
      ? safeParseWithLogging(
          OffchainCryptoCurrencyFragmentSchema,
          dbCryptoCurrency.asset[0],
          'offchain cryptocurrency'
        )
      : undefined;

    const topHoldersSum = cryptocurrency.holders.reduce(
      (sum, holder) => sum + holder.valueExact,
      0n
    );
    const concentration =
      cryptocurrency.totalSupplyExact === 0n
        ? 0
        : Number((topHoldersSum * 100n) / cryptocurrency.totalSupplyExact);

    return {
      ...cryptocurrency,
      ...{
        private: false,
        ...offchainCryptoCurrency,
      },
      concentration,
    };
  } catch (error) {
    // Re-throw with more context
    throw error instanceof Error
      ? error
      : new Error(`Failed to fetch cryptocurrency with address ${address}`);
  }
}

/**
 * Generates a consistent query key for cryptocurrency detail queries
 *
 * @param params - Object containing the cryptocurrency address
 * @returns Array representing the query key for React Query
 */
export const getQueryKey = ({ address }: CryptoCurrencyDetailProps) =>
  [
    'asset',
    'detail',
    assetConfig.cryptocurrency.queryKey,
    getAddress(address),
  ] as const;

/**
 * React Query hook for fetching cryptocurrency details
 *
 * @param params - Object containing the cryptocurrency address
 * @returns Query result with cryptocurrency data, config, and query key
 */
export function useCryptoCurrencyDetail({
  address,
}: CryptoCurrencyDetailProps) {
  const queryKey = getQueryKey({ address });

  const result = useSuspenseQuery({
    queryKey,
    queryFn: () => getCryptoCurrencyDetail({ address }),
  });

  return {
    ...result,
    config: assetConfig.cryptocurrency,
    queryKey,
  };
}
