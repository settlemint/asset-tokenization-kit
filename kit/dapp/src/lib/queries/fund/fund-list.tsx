import { fetchAllHasuraPages, fetchAllTheGraphPages } from '@/lib/pagination';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { formatNumber } from '@/lib/utils/number';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { cache } from 'react';
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
 * Fetches a list of funds from both on-chain and off-chain sources
 *
 * @param options - Options for fetching fund list
 *
 * @remarks
 * This function fetches data from both The Graph (on-chain) and Hasura (off-chain),
 * then merges the results to provide a complete view of each fund.
 */
export const getFundList = cache(async () => {
  const [theGraphFunds, dbAssets] = await Promise.all([
    fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientStarterkits.request(FundList, {
        first,
        skip,
      });

      const funds = result.funds || [];

      return funds;
    }),

    fetchAllHasuraPages(async (pageLimit, offset) => {
      const result = await hasuraClient.request(OffchainFundList, {
        limit: pageLimit,
        offset,
      });
      return result.asset_aggregate.nodes || [];
    }),
  ]);

  // Parse and validate the data using Zod schemas
  const validatedFunds = theGraphFunds.map((fund) =>
    safeParseWithLogging(FundFragmentSchema, fund, 'fund')
  );

  const validatedDbAssets = dbAssets.map((asset) =>
    safeParseWithLogging(OffchainFundFragmentSchema, asset, 'offchain fund')
  );

  const assetsById = new Map(
    validatedDbAssets.map((asset) => [getAddress(asset.id), asset])
  );

  const funds = validatedFunds.map((fund) => {
    const dbAsset = assetsById.get(getAddress(fund.id));

    return {
      ...fund,
      ...{
        private: false,
        ...dbAsset,
      },
    };
  });

  return funds.map((fund) => ({
    ...fund,
    // replace all the BigDecimals with formatted strings
    totalSupply: formatNumber(fund.totalSupply),
  }));
});
