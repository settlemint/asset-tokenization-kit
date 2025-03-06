import { fetchAllHasuraPages, fetchAllTheGraphPages } from "@/lib/pagination";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKits,
  theGraphGraphqlKits,
} from "@/lib/settlemint/the-graph";
import { safeParseWithLogging } from "@/lib/utils/zod";
import { cache } from "react";
import { getAddress } from "viem";
import {
  EquityFragment,
  EquityFragmentSchema,
  OffchainEquityFragment,
  OffchainEquityFragmentSchema,
} from "./equity-fragment";

/**
 * GraphQL query to fetch on-chain equity list from The Graph
 *
 * @remarks
 * Retrieves equitys ordered by total supply in descending order
 */
const EquityList = theGraphGraphqlKits(
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
 * Fetches a list of equitys from both on-chain and off-chain sources
 *
 * @param options - Options for fetching equity list
 *
 * @remarks
 * This function fetches data from both The Graph (on-chain) and Hasura (off-chain),
 * then merges the results to provide a complete view of each equity.
 */
export const getEquityList = cache(async () => {
  const [theGraphEquitys, dbAssets] = await Promise.all([
    fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientKits.request(EquityList, {
        first,
        skip,
      });

      const equitys = result.equities || [];

      return equitys;
    }),

    fetchAllHasuraPages(async (pageLimit, offset) => {
      const result = await hasuraClient.request(OffchainEquityList, {
        limit: pageLimit,
        offset,
      });
      return result.asset_aggregate.nodes || [];
    }),
  ]);

  // Parse and validate the data using Zod schemas
  const validatedEquitys = theGraphEquitys.map((equity) =>
    safeParseWithLogging(EquityFragmentSchema, equity, "equity")
  );

  const validatedDbAssets = dbAssets.map((asset) =>
    safeParseWithLogging(OffchainEquityFragmentSchema, asset, "offchain equity")
  );

  const assetsById = new Map(
    validatedDbAssets.map((asset) => [getAddress(asset.id), asset])
  );

  const equitys = validatedEquitys.map((equity) => {
    const dbAsset = assetsById.get(getAddress(equity.id));

    return {
      ...equity,
      ...{
        private: false,
        ...dbAsset,
      },
    };
  });

  return equitys;
});
