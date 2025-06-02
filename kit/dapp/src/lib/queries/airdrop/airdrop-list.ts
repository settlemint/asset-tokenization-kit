import "server-only";

import { fetchAllTheGraphPages } from "@/lib/pagination";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { t } from "@/lib/utils/typebox";
import { safeParse } from "@/lib/utils/typebox/index";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import { AirdropFragment } from "./airdrop-fragment";
import { OnChainAirdropSchema } from "./airdrop-schema";

/**
 * GraphQL query to fetch on-chain airdrop list from The Graph
 *
 * @remarks
 * Retrieves airdrops ordered by total claimed amount in descending order
 */
const AirdropList = theGraphGraphqlKit(
  `
  query AirdropList($first: Int, $skip: Int) {
    airdrops(orderBy: totalClaimedExact, orderDirection: desc, first: $first, skip: $skip) {
      ...AirdropFragment
    }
  }
`,
  [AirdropFragment]
);

/**
 * Fetches a list of airdrops from on-chain sources
 *
 * @remarks
 * This function fetches data from The Graph (on-chain) to provide
 * a complete view of airdrop activity including claimed amounts and recipients.
 */
export const getAirdropList = withTracing(
  "queries",
  "getAirdropList",
  cache(async () => {
    "use cache";
    cacheTag("airdrop");

    const onChainAirdrops = await fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientKit.request(
        AirdropList,
        {
          first,
          skip,
        },
        {
          "X-GraphQL-Operation-Name": "AirdropList",
          "X-GraphQL-Operation-Type": "query",
        }
      );

      return safeParse(t.Array(OnChainAirdropSchema), result.airdrops || []);
    });

    return onChainAirdrops;
  })
);
