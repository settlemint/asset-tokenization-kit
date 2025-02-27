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
  EquityFragment,
  EquityFragmentSchema,
  OffchainEquityFragment,
  OffchainEquityFragmentSchema,
} from './equity-fragment';

/**
 * GraphQL query to fetch on-chain equity list from The Graph
 *
 * @remarks
 * Retrieves equitys ordered by total supply in descending order
 */
const EquityList = theGraphGraphqlStarterkits(
  `
  query EquityList($first: Int, $skip: Int) {
    equities(orderBy: totalSupplyExact, orderDirection: desc, first: $first, skip: $skip) {
      ...EquityFragment
    }
  }
`,
  [EquityFragment]
);

/**
 * GraphQL query to fetch off-chain equity list from Hasura
 */
const OffchainEquityList = hasuraGraphql(
  `
  query OffchainEquityList($limit: Int, $offset: Int) {
    asset_aggregate(limit: $limit, offset: $offset) {
      nodes {
        ...OffchainEquityFragment
      }
    }
  }
`,
  [OffchainEquityFragment]
);

/**
 * Options for fetching equity list
 *
 */
export interface EquityListOptions {
  limit?: number; // Optional limit to restrict total items fetched
}

/**
 * Cached function to fetch raw equity data from both on-chain and off-chain sources
 */
const fetchEquityListData = unstable_cache(
  async (limit?: number) => {
    const [theGraphEquities, dbAssets] = await Promise.all([
      fetchAllTheGraphPages(async (first, skip) => {
        const result = await theGraphClientStarterkits.request(EquityList, {
          first,
          skip,
        });

        const equities = result.equities || [];

        // If we have a limit, check if we should stop
        if (limit && skip + equities.length >= limit) {
          return equities.slice(0, limit - skip);
        }

        return equities;
      }, limit),

      fetchAllHasuraPages(async (pageLimit, offset) => {
        const result = await hasuraClient.request(OffchainEquityList, {
          limit: pageLimit,
          offset,
        });
        return result.asset_aggregate.nodes || [];
      }, limit),
    ]);

    return { theGraphEquities, dbAssets };
  },
  ['asset', 'equity', 'list'],
  {
    revalidate: 60 * 60,
    tags: ['asset', 'equity'],
  }
);

/**
 * Fetches a list of equities from both on-chain and off-chain sources
 *
 * @param options - Options for fetching equity list
 *
 * @remarks
 * This function fetches data from both The Graph (on-chain) and Hasura (off-chain),
 * then merges the results to provide a complete view of each equity.
 */
export async function getEquityList({ limit }: EquityListOptions = {}) {
  const { theGraphEquities, dbAssets } = await fetchEquityListData(limit);

  // Parse and validate the data using Zod schemas
  const validatedEquities = theGraphEquities.map((equity) =>
    safeParseWithLogging(EquityFragmentSchema, equity, 'equity')
  );

  const validatedDbAssets = dbAssets.map((asset) =>
    safeParseWithLogging(OffchainEquityFragmentSchema, asset, 'offchain equity')
  );

  // Cross-reference on-chain and off-chain data to build complete equities
  const equityMap = new Map();

  // First add all on-chain equities to the map
  validatedEquities.forEach((equity) => {
    equityMap.set(getAddress(equity.id), {
      ...equity,
      hasOffchainData: false,
    });
  });

  // Then match off-chain data with on-chain equities where possible
  validatedDbAssets.forEach((asset) => {
    const normalizedAddress = getAddress(asset.id);
    const existingEquity = equityMap.get(normalizedAddress);

    if (existingEquity) {
      // Update existing entry with off-chain data
      equityMap.set(normalizedAddress, {
        ...existingEquity,
        private: asset.private,
        hasOffchainData: true,
      });
    } else {
      // This is an off-chain only equity, but we don't have enough data
      // to create a valid equity object. Skip it for now.
    }
  });

  return Array.from(equityMap.values());
}
