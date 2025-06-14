import "server-only";

import type { CurrencyCode } from "@/lib/db/schema-settings";
import { fetchAllHasuraPages, fetchAllTheGraphPages } from "@/lib/pagination";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withTracing } from "@/lib/utils/sentry-tracing";
import { safeParse, t } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import { getAddress } from "viem";
import { depositsCalculateFields } from "./deposit-calculated";
import { OffchainDepositFragment } from "./deposit-fragment";
import { OffChainDepositSchema, OnChainDepositSchema } from "./deposit-schema";
/**
 * GraphQL query to fetch on-chain tokenized deposit list from The Graph
 *
 * @remarks
 * Retrieves tokenized deposits ordered by total supply in descending order
 */
// const DepositList = theGraphGraphqlKit(
//   `
//   query DepositList($first: Int, $skip: Int) {
//     deposits(orderBy: totalSupplyExact, orderDirection: desc, first: $first, skip: $skip) {
//       ...DepositFragment
//     }
//   }
// `,
//   [DepositFragment]
// );

/**
 * GraphQL query to fetch off-chain tokenized deposit list from Hasura
 */
const OffchainDepositList = hasuraGraphql(
  `
  query OffchainDepositList($limit: Int, $offset: Int) {
    asset_aggregate(limit: $limit, offset: $offset) {
      nodes {
        ...OffchainDepositFragment
      }
    }
  }
`,
  [OffchainDepositFragment]
);

/**
 * Fetches a list of tokenized deposits from both on-chain and off-chain sources
 *
 * @remarks
 * This function fetches data from both The Graph (on-chain) and Hasura (off-chain),
 * then merges the results to provide a complete view of each tokenized deposit.
 */
export const getDepositList = withTracing(
  "queries",
  "getDepositList",
  cache(async (userCurrency: CurrencyCode) => {
    "use cache";
    cacheTag("asset");
    const [onChainDeposits, offChainDeposits] = await Promise.all([
      fetchAllTheGraphPages(async (first, skip) => {
        //       // const result = await theGraphClientKit.request(
        //       //           DepositList,
        //       //           {
        //       //             first,
        //       //             skip,
        //       //           },
        //       //           {
        //       //             "X-GraphQL-Operation-Name": "DepositList",
        //       //             "X-GraphQL-Operation-Type": "query",
        //       //           }
        //       //         );

        return safeParse(t.Array(OnChainDepositSchema), []);
      }),

      fetchAllHasuraPages(async (pageLimit, offset) => {
        const result = await hasuraClient.request(
          OffchainDepositList,
          {
            limit: pageLimit,
            offset,
          },
          {
            "X-GraphQL-Operation-Name": "OffchainDepositList",
            "X-GraphQL-Operation-Type": "query",
          }
        );

        return safeParse(
          t.Array(OffChainDepositSchema),
          result.asset_aggregate.nodes || []
        );
      }),
    ]);

    const assetsById = new Map(
      offChainDeposits.map((asset) => [getAddress(asset.id), asset])
    );

    const calculatedFields = await depositsCalculateFields(
      onChainDeposits,
      userCurrency
    );

    const deposits = onChainDeposits.map((deposit) => {
      const offChainDeposit = assetsById.get(getAddress(deposit.id));

      const calculatedDeposit = calculatedFields.get(deposit.id)!;

      return {
        ...deposit,
        ...offChainDeposit,
        ...calculatedDeposit,
      };
    });

    return deposits;
  })
);
