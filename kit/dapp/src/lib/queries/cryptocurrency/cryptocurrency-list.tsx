import { fetchAllHasuraPages, fetchAllTheGraphPages } from '@/lib/pagination';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { unstable_cache } from 'next/cache';
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
 * Cached function to fetch raw cryptocurrency data from both on-chain and off-chain sources
 */
const fetchCryptoCurrencyListData = unstable_cache(
  async (limit?: number) => {
    console.log('fetchCryptoCurrencyListData', limit);

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

    return { theGraphCryptoCurrencies, dbAssets };
  },
  ['asset', 'cryptocurrency', 'list'],
  {
    revalidate: 60 * 60,
    tags: ['asset', 'cryptocurrency'],
  }
);

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
  const { theGraphCryptoCurrencies, dbAssets } =
    await fetchCryptoCurrencyListData(limit);

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

  // Cross-reference on-chain and off-chain data to build complete cryptocurrencies
  const cryptoMap = new Map();

  // First add all on-chain cryptocurrencies to the map
  validatedCryptoCurrencies.forEach((crypto) => {
    cryptoMap.set(getAddress(crypto.id), {
      ...crypto,
      hasOffchainData: false,
    });
  });

  // Then match off-chain data with on-chain cryptocurrencies where possible
  validatedDbAssets.forEach((asset) => {
    const normalizedAddress = getAddress(asset.id);
    const existingCrypto = cryptoMap.get(normalizedAddress);

    if (existingCrypto) {
      // Update existing entry with off-chain data
      cryptoMap.set(normalizedAddress, {
        ...existingCrypto,
        private: asset.private,
        hasOffchainData: true,
      });
    } else {
      // This is an off-chain only cryptocurrency, but we don't have enough data
      // to create a valid cryptocurrency object. Skip it for now.
    }
  });

  return Array.from(cryptoMap.values());
}
