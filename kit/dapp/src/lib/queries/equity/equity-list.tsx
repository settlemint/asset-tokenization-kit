import { fetchAllHasuraPages, fetchAllTheGraphPages } from "@/lib/pagination";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { t } from "@/lib/utils/typebox";
import { safeParse } from "@/lib/utils/typebox/index";
import { cache } from "react";
import { getAddress } from "viem";
import { equityCalculateFields } from "./equity-calculated";
import { EquityFragment, OffchainEquityFragment } from "./equity-fragment";
import { OffChainEquitySchema, OnChainEquitySchema } from "./equity-schema";

/**
 * GraphQL query to fetch on-chain equity list from The Graph
 *
 * @remarks
 * Retrieves equitys ordered by total supply in descending order
 */
const EquityList = theGraphGraphqlKit(
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
  const [onChainEquities, offChainEquities] = await Promise.all([
    fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientKit.request(EquityList, {
        first,
        skip,
      });

      return safeParse(t.Array(OnChainEquitySchema), result.equities || []);
    }),

    fetchAllHasuraPages(async (pageLimit, offset) => {
      const result = await hasuraClient.request(OffchainEquityList, {
        limit: pageLimit,
        offset,
      });

      return safeParse(
        t.Array(OffChainEquitySchema),
        result.asset_aggregate.nodes || []
      );
    }),
  ]);

  const assetsById = new Map(
    offChainEquities.map((asset) => [getAddress(asset.id), asset])
  );

  const equities = await Promise.all(
    onChainEquities.map(async (equity) => {
      const offChainEquity = assetsById.get(getAddress(equity.id));

      const calculatedFields = await equityCalculateFields(
        equity,
        offChainEquity
      );

      return {
        ...equity,
        ...offChainEquity,
        ...calculatedFields,
      };
    })
  );

  return equities;
});
