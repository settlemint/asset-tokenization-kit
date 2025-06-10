import "server-only";

import type { CurrencyCode } from "@/lib/db/schema-settings";
import { fetchAllHasuraPages, fetchAllTheGraphPages } from "@/lib/pagination";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/sentry-tracing";
import { t } from "@/lib/utils/typebox";
import { safeParse } from "@/lib/utils/typebox/index";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getAddress } from "viem";
import { bondsCalculateFields } from "./bond-calculated";
import { BondFragment, OffchainBondFragment } from "./bond-fragment";
import { OffChainBondSchema, OnChainBondSchema } from "./bond-schema";

/**
 * GraphQL query to fetch on-chain bond list from The Graph
 *
 * @remarks
 * Retrieves bonds ordered by total supply in descending order
 */
// const BondList = theGraphGraphqlKit(
//   `
//   query BondList($first: Int, $skip: Int) {
//     bonds(orderBy: totalSupplyExact, orderDirection: desc, first: $first, skip: $skip) {
//       ...BondFragment
//     }
//   }
// `,
//   [BondFragment]
// );

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
export const getBondList = withTracing(
  "queries",
  "getBondList",
  async (userCurrency: CurrencyCode) => {
    "use cache";
    cacheTag("asset");
    const [onChainBonds, offChainBonds] = await Promise.all([
      fetchAllTheGraphPages(async (first, skip) => {
        //       // const result = await theGraphClientKit.request(BondList, {
      //         //   first,
      //         //   skip,
      //         // });

        // NOTE: HARDCODED SO IT STILL COMPILES
        return safeParse(t.Array(OnChainBondSchema), []);
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

    const calculatedFields = await bondsCalculateFields(
      onChainBonds,
      userCurrency
    );

    const bonds = onChainBonds.map((bond) => {
      const offChainBond = assetsById.get(bond.id);

      const calculatedBond = calculatedFields.get(bond.id)!;

      return {
        ...bond,
        ...offChainBond,
        ...calculatedBond,
      };
    });

    return bonds;
  }
);
