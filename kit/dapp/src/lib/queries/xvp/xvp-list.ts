import "server-only";

import type { CurrencyCode } from "@/lib/db/schema-settings";
import { fetchAllTheGraphPages } from "@/lib/pagination";
import { withTracing } from "@/lib/utils/sentry-tracing";
import { t } from "@/lib/utils/typebox";
import { safeParse } from "@/lib/utils/typebox/index";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import type { Address } from "viem";
import { calculateXvPSettlement } from "./xvp-calculated";
import { OnChainXvPSettlementSchema, type XvPSettlement } from "./xvp-schema";

/**
 * GraphQL query to fetch XvPSettlement list from The Graph
 */
// const XvPSettlementList = theGraphGraphqlKit(
//   `
//   query XvPSettlementList($first: Int, $skip: Int, $user: String!) {
//     xvPSettlements(orderBy: createdAt, orderDirection: desc, first: $first, skip: $skip, where: { participants_contains: [$user] }) {
//       ...XvPSettlementFragment
//     }
//   }
// `,
//   [XvPSettlementFragment]
// );

/**
 * Fetches a list of XvPSettlements from The Graph and enriches them.
 *
 * @remarks
 * This function fetches data from The Graph and returns a list of enriched XvP settlements.
 */
export const getXvPSettlementList = withTracing(
  "queries",
  "getXvPSettlementList",
  async (
    userCurrency: CurrencyCode,
    userAddress: Address
  ): Promise<XvPSettlement[]> => {
    "use cache";
    cacheTag("trades");

    const onChainSettlements = await fetchAllTheGraphPages(
      async (first, skip) => {
        //       // const result = await theGraphClientKit.request(XvPSettlementList, {
        //       //           first,
        //       //           skip,
        //       //           user: userAddress,
        //       //         });

        return safeParse(t.Array(OnChainXvPSettlementSchema), []);
      }
    );

    return Promise.all(
      onChainSettlements.map(async (onChainSettlement) => {
        return calculateXvPSettlement(onChainSettlement, userCurrency);
      })
    );
  }
);
