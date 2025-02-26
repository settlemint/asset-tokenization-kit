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
 * Fetches a list of bonds from both on-chain and off-chain sources
 *
 * @param options - Options for fetching bond list
 *
 * @remarks
 * This function fetches data from both The Graph (on-chain) and Hasura (off-chain),
 * then merges the results to provide a complete view of each bond.
 */
export async function getBondList({ limit }: BondListOptions = {}) {
  try {
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

    // Parse and validate the data using Zod schemas
    const validatedBonds = theGraphBonds.map((bond) =>
      safeParseWithLogging(BondFragmentSchema, bond, 'bond')
    );

    const validatedDbAssets = dbAssets.map((asset) =>
      safeParseWithLogging(OffchainBondFragmentSchema, asset, 'offchain bond')
    );

    const assetsById = new Map(
      validatedDbAssets.map((asset) => [getAddress(asset.id), asset])
    );

    const bonds = validatedBonds.map((bond) => {
      const dbAsset = assetsById.get(getAddress(bond.id));

      return {
        ...bond,
        ...{
          private: false,
          ...dbAsset,
        },
      };
    });

    return bonds;
  } catch (error) {
    console.error('Error fetching bond list:', error);
    return [];
  }
}

/**
 * Creates a memoized query key for bond list queries
 *
 * @param [options] - Options for the bond list query
 */
export const getQueryKey = (options?: BondListOptions) =>
  ['asset', 'bond', options?.limit ?? 'all'] as const;

/**
 * React Query hook for fetching bond list
 *
 * @param [options] - Options for fetching bond list
 *
 * @example
 * ```tsx
 * const { data: bonds, isLoading } = useBondList({ limit: 10 });
 * ```
 */
export function useBondList(options?: BondListOptions) {
  const queryKey = getQueryKey(options);

  const result = useSuspenseQuery({
    queryKey,
    queryFn: () => getBondList(options),
  });

  return {
    ...result,
    queryKey,
    // Inline bond config values
    assetType: 'bond' as const,
    urlSegment: 'bonds',
    theGraphTypename: 'Bond' as const,
  };
}
