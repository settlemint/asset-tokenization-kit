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
import { BondFragment, OffchainBondFragment } from "./bond-fragment";
import { OffChainBondSchema, OnChainBondSchema } from "./bond-schema";

/**
 * GraphQL query to fetch on-chain bond list from The Graph
 *
 * @remarks
 * Retrieves bonds ordered by total supply in descending order
 */
const BondList = theGraphGraphqlKit(
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
  const [onChainBonds, offChainBonds] = await Promise.all([
    fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientKit.request(BondList, {
        first,
        skip,
      });

      return safeParse(t.Array(OnChainBondSchema), result.bonds || []);
    }),

    fetchAllHasuraPages(async (pageLimit, offset) => {
      const result = await hasuraClient.request(OffchainBondList, {
        limit: pageLimit,
        offset,
      });

      return safeParse(
        t.Array(OffChainBondSchema),
        result.asset_aggregate.nodes || []
      );
    }),
  ]);

  const assetsById = new Map(
    offChainBonds.map((asset) => [getAddress(asset.id), asset])
  );

  const bonds = onChainBonds.map((bond) => {
    const offChainBond = assetsById.get(getAddress(bond.id));

    return {
      ...bond,
      ...offChainBond,
    };
  });

  return bonds;
});
