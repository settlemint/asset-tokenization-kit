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
  BondFragment,
  BondFragmentSchema,
  OffchainBondFragment,
  OffchainBondFragmentSchema,
} from './bond-fragment';

/**
 * GraphQL query to fetch on-chain bond list from The Graph
 *
 * @remarks
 * Retrieves bonds ordered by total supply in descending order
 */
const BondList = theGraphGraphqlStarterkits(
  `
  query BondList($first: Int, $skip: Int) {
    bonds(orderBy: totalSupplyExact, orderDirection: desc, first: $first, skip: $skip) {
      ...BondFragment
    }
  }
`,
  [BondFragment]
);

/**
 * GraphQL query to fetch off-chain bond list from Hasura
 */
const OffchainBondList = hasuraGraphql(
  `
  query OffchainBondList($limit: Int, $offset: Int) {
    asset_aggregate(limit: $limit, offset: $offset) {
      nodes {
        ...OffchainBondFragment
      }
    }
  }
`,
  [OffchainBondFragment]
);

/**
 * Options for fetching bond list
 *
 */
export interface BondListOptions {
  limit?: number; // Optional limit to restrict total items fetched
}

/**
 * Cached function to fetch raw bond data from both on-chain and off-chain sources
 */
const fetchBondListData = unstable_cache(
  async (limit?: number) => {
    console.log('fetchBondListData', limit);

    const [theGraphBonds, dbAssets] = await Promise.all([
      fetchAllTheGraphPages(async (first, skip) => {
        const result = await theGraphClientStarterkits.request(BondList, {
          first,
          skip,
        });

        const bonds = result.bonds || [];

        // If we have a limit, check if we should stop
        if (limit && skip + bonds.length >= limit) {
          return bonds.slice(0, limit - skip);
        }

        return bonds;
      }, limit),

      fetchAllHasuraPages(async (pageLimit, offset) => {
        const result = await hasuraClient.request(OffchainBondList, {
          limit: pageLimit,
          offset,
        });
        return result.asset_aggregate.nodes || [];
      }, limit),
    ]);

    return { theGraphBonds, dbAssets };
  },
  ['asset', 'bond', 'list'],
  {
    revalidate: 60 * 60,
    tags: ['asset', 'bond'],
  }
);

/**
 * Fetches a list of bonds from both on-chain and off-chain sources
 *
 * @param options - Options for fetching bond list
 *
 * @remarks
 * This function fetches data from both The Graph (on-chain) and Hasura (off-chain),
 * then merges the results to provide a complete view of each bond.
 */
export async function getBondList({ limit }: BondListOptions = {}) {
  const { theGraphBonds, dbAssets } = await fetchBondListData(limit);

  // Parse and validate the data using Zod schemas
  const validatedBonds = theGraphBonds.map((bond) =>
    safeParseWithLogging(BondFragmentSchema, bond, 'bond')
  );

  const validatedDbAssets = dbAssets.map((asset) =>
    safeParseWithLogging(OffchainBondFragmentSchema, asset, 'offchain bond')
  );

  // Cross-reference on-chain and off-chain data to build complete bonds
  const bondMap = new Map();

  // First add all on-chain bonds to the map
  validatedBonds.forEach((bond) => {
    bondMap.set(getAddress(bond.id), {
      ...bond,
      hasOffchainData: false,
    });
  });

  // Then match off-chain data with on-chain bonds where possible
  validatedDbAssets.forEach((asset) => {
    const normalizedAddress = getAddress(asset.id);
    const existingBond = bondMap.get(normalizedAddress);

    if (existingBond) {
      // Update existing entry with off-chain data
      bondMap.set(normalizedAddress, {
        ...existingBond,
        private: asset.private,
        hasOffchainData: true,
      });
    } else {
      // This is an off-chain only bond, but we don't have enough data
      // to create a valid bond object. Skip it for now.
    }
  });

  return Array.from(bondMap.values());
}
