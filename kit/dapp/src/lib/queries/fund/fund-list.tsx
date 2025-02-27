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
  FundFragment,
  FundFragmentSchema,
  OffchainFundFragment,
  OffchainFundFragmentSchema,
} from './fund-fragment';

/**
 * GraphQL query to fetch on-chain fund list from The Graph
 *
 * @remarks
 * Retrieves funds ordered by total supply in descending order
 */
const FundList = theGraphGraphqlStarterkits(
  `
  query FundList($first: Int, $skip: Int) {
    funds(orderBy: totalSupplyExact, orderDirection: desc, first: $first, skip: $skip) {
      ...FundFragment
    }
  }
`,
  [FundFragment]
);

/**
 * GraphQL query to fetch off-chain fund list from Hasura
 */
const OffchainFundList = hasuraGraphql(
  `
  query OffchainFundList($limit: Int, $offset: Int) {
    asset_aggregate(limit: $limit, offset: $offset) {
      nodes {
        ...OffchainFundFragment
      }
    }
  }
`,
  [OffchainFundFragment]
);

/**
 * Options for fetching fund list
 *
 */
export interface FundListOptions {
  limit?: number; // Optional limit to restrict total items fetched
}

/**
 * Cached function to fetch raw fund data from both on-chain and off-chain sources
 */
const fetchFundListData = unstable_cache(
  async (limit?: number) => {
    const [theGraphFunds, dbAssets] = await Promise.all([
      fetchAllTheGraphPages(async (first, skip) => {
        const result = await theGraphClientStarterkits.request(FundList, {
          first,
          skip,
        });

        const funds = result.funds || [];

        // If we have a limit, check if we should stop
        if (limit && skip + funds.length >= limit) {
          return funds.slice(0, limit - skip);
        }

        return funds;
      }, limit),

      fetchAllHasuraPages(async (pageLimit, offset) => {
        const result = await hasuraClient.request(OffchainFundList, {
          limit: pageLimit,
          offset,
        });
        return result.asset_aggregate.nodes || [];
      }, limit),
    ]);

    return { theGraphFunds, dbAssets };
  },
  ['asset', 'fund', 'list'],
  {
    revalidate: 60 * 60,
    tags: ['asset', 'fund'],
  }
);

/**
 * Fetches a list of funds from both on-chain and off-chain sources
 *
 * @param options - Options for fetching fund list
 *
 * @remarks
 * This function fetches data from both The Graph (on-chain) and Hasura (off-chain),
 * then merges the results to provide a complete view of each fund.
 */
export async function getFundList({ limit }: FundListOptions = {}) {
  const { theGraphFunds, dbAssets } = await fetchFundListData(limit);

  // Parse and validate the data using Zod schemas
  const validatedFunds = theGraphFunds.map((fund) =>
    safeParseWithLogging(FundFragmentSchema, fund, 'fund')
  );

  const validatedDbAssets = dbAssets.map((asset) =>
    safeParseWithLogging(OffchainFundFragmentSchema, asset, 'offchain fund')
  );

  // Cross-reference on-chain and off-chain data to build complete funds
  const fundMap = new Map();

  // First add all on-chain funds to the map
  validatedFunds.forEach((fund) => {
    fundMap.set(getAddress(fund.id), {
      ...fund,
      hasOffchainData: false,
    });
  });

  // Then match off-chain data with on-chain funds where possible
  validatedDbAssets.forEach((asset) => {
    const normalizedAddress = getAddress(asset.id);
    const existingFund = fundMap.get(normalizedAddress);

    if (existingFund) {
      // Update existing entry with off-chain data
      fundMap.set(normalizedAddress, {
        ...existingFund,
        private: asset.private,
        hasOffchainData: true,
      });
    } else {
      // This is an off-chain only fund, but we don't have enough data
      // to create a valid fund object. Skip it for now.
    }
  });

  return Array.from(fundMap.values());
}
