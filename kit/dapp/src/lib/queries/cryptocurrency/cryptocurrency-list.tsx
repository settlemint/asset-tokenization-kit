import { assetConfig } from '@/lib/config/assets';
import { fetchAllHasuraPages, fetchAllTheGraphPages } from '@/lib/pagination';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getAddress } from 'viem';
import {
  CryptoCurrencyFragment,
  CryptoCurrencyFragmentSchema,
  OffchainCryptoCurrencyFragment,
  OffchainCryptoCurrencyFragmentSchema,
} from './cryptocurrency-fragment';

/**
 * GraphQL query to fetch on-chain cryptocurrency list from The Graph
 *
 * @remarks
 * Retrieves cryptocurrencys ordered by total supply in descending order
 */
const CryptoCurrencyList = theGraphGraphqlStarterkits(
  `
  query CryptoCurrencyList($first: Int, $skip: Int) {
    cryptoCurrencies(orderBy: totalSupplyExact, orderDirection: desc, first: $first, skip: $skip) {
      ...CryptoCurrencyFragment
    }
  }
`,
  [CryptoCurrencyFragment]
);

/**
 * GraphQL query to fetch off-chain cryptocurrency list from Hasura
 */
const OffchainCryptoCurrencyList = hasuraGraphql(
  `
  query OffchainCryptoCurrencyList($limit: Int, $offset: Int) {
    asset_aggregate(limit: $limit, offset: $offset) {
      nodes {
        ...OffchainCryptoCurrencyFragment
      }
    }
  }
`,
  [OffchainCryptoCurrencyFragment]
);

/**
 * Options for fetching cryptocurrency list
 *
 */
export interface CryptoCurrencyListOptions {
  limit?: number; // Optional limit to restrict total items fetched
}

/**
 * Fetches a list of cryptocurrencys from both on-chain and off-chain sources
 *
 * @param options - Options for fetching cryptocurrency list
 *
 * @remarks
 * This function fetches data from both The Graph (on-chain) and Hasura (off-chain),
 * then merges the results to provide a complete view of each cryptocurrency.
 */
export async function getCryptoCurrencyList({
  limit,
}: CryptoCurrencyListOptions = {}) {
  try {
    const [theGraphCryptoCurrencies, dbAssets] = await Promise.all([
      fetchAllTheGraphPages(async (first, skip) => {
        const result = await theGraphClientStarterkits.request(
          CryptoCurrencyList,
          {
            first,
            skip,
          }
        );

        const cryptoCurrencies = result.cryptoCurrencies || [];

        // If we have a limit, check if we should stop
        if (limit && skip + cryptoCurrencies.length >= limit) {
          return cryptoCurrencies.slice(0, limit - skip);
        }

        return cryptoCurrencies;
      }, limit),

      fetchAllHasuraPages(async (pageLimit, offset) => {
        const result = await hasuraClient.request(OffchainCryptoCurrencyList, {
          limit: pageLimit,
          offset,
        });
        return result.asset_aggregate.nodes || [];
      }, limit),
    ]);

    // Parse and validate the data using Zod schemas
    const validatedCryptoCurrencies = theGraphCryptoCurrencies.map(
      (cryptocurrency) =>
        safeParseWithLogging(
          CryptoCurrencyFragmentSchema,
          cryptocurrency,
          'cryptocurrency'
        )
    );

    const validatedDbAssets = dbAssets.map((asset) =>
      safeParseWithLogging(
        OffchainCryptoCurrencyFragmentSchema,
        asset,
        'offchain cryptocurrency'
      )
    );

    const assetsById = new Map(
      validatedDbAssets.map((asset) => [getAddress(asset.id), asset])
    );

    const cryptoCurrencies = validatedCryptoCurrencies.map((cryptocurrency) => {
      const dbAsset = assetsById.get(getAddress(cryptocurrency.id));

      return {
        ...cryptocurrency,
        ...{
          private: false,
          ...dbAsset,
        },
      };
    });

    return cryptoCurrencies;
  } catch (error) {
    console.error('Error fetching cryptocurrency list:', error);
    return [];
  }
}

/**
 * Creates a memoized query key for cryptocurrency list queries
 *
 * @param [options] - Options for the cryptocurrency list query
 */
export const getQueryKey = (options?: CryptoCurrencyListOptions) =>
  [
    'asset',
    assetConfig.cryptocurrency.queryKey,
    options?.limit ?? 'all',
  ] as const;

/**
 * React Query hook for fetching cryptocurrency list
 *
 * @param [options] - Options for fetching cryptocurrency list
 *
 * @example
 * ```tsx
 * const { data: cryptocurrencys, isLoading } = useCryptoCurrencyList({ limit: 10 });
 * ```
 */
export function useCryptoCurrencyList(options?: CryptoCurrencyListOptions) {
  const queryKey = getQueryKey(options);

  const result = useSuspenseQuery({
    queryKey,
    queryFn: () => getCryptoCurrencyList(options),
  });

  return {
    ...result,
    config: assetConfig.cryptocurrency,
    queryKey,
  };
}
