import { fetchAllHasuraPages, fetchAllTheGraphPages } from "@/lib/pagination";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from "@/lib/settlemint/the-graph";
import { formatNumber } from "@/lib/utils/number";
import { safeParseWithLogging } from "@/lib/utils/zod";
import { cache } from "react";
import { getAddress } from "viem";
import {
  BondFragment,
  BondFragmentSchema,
  OffchainBondFragment,
  OffchainBondFragmentSchema,
} from "./bond-fragment";

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
 * Fetches a list of bonds from both on-chain and off-chain sources
 *
 * @param options - Options for fetching bond list
 *
 * @remarks
 * This function fetches data from both The Graph (on-chain) and Hasura (off-chain),
 * then merges the results to provide a complete view of each bond.
 */
export const getBondList = cache(async () => {
  const [theGraphBonds, dbAssets] = await Promise.all([
    fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientStarterkits.request(BondList, {
        first,
        skip,
      });

      const bonds = result.bonds || [];

      return bonds;
    }),

    fetchAllHasuraPages(async (pageLimit, offset) => {
      const result = await hasuraClient.request(OffchainBondList, {
        limit: pageLimit,
        offset,
      });
      return result.asset_aggregate.nodes || [];
    }),
  ]);

  // Parse and validate the data using Zod schemas
  const validatedBonds = theGraphBonds.map((bond) =>
    safeParseWithLogging(BondFragmentSchema, bond, "bond")
  );

  const validatedDbAssets = dbAssets.map((asset) =>
    safeParseWithLogging(OffchainBondFragmentSchema, asset, "offchain bond")
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

  return bonds.map((bond) => ({
    ...bond,
    // replace all the BigDecimals with formatted strings
    totalSupply: formatNumber(bond.totalSupply),
  }));
});
