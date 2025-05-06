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
import { XvPSettlementFragment } from "./xvp-fragment";
import { XvPSettlementSchema } from "./xvp-schema";

/**
 * GraphQL query to fetch XvPSettlement list from The Graph
 */
const XvPSettlementList = theGraphGraphqlKit(
  `
  query XvPSettlementList($first: Int, $skip: Int) {
    xvPSettlements(orderBy: cutoffDate, orderDirection: desc, first: $first, skip: $skip) {
      ...XvPSettlementFragment
    }
  }
`,
  [XvPSettlementFragment]
);

/**
 * Fetches a list of XvPSettlements from The Graph
 *
 * @remarks
 * This function fetches data from The Graph and returns a list of XvP settlements.
 */
export const getXvPSettlementList = withTracing(
  "queries",
  "getXvPSettlementList",
  async () => {
    "use cache";
    cacheTag("trades");

    return await fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientKit.request(XvPSettlementList, {
        first,
        skip,
      });

      return safeParse(t.Array(XvPSettlementSchema), result.xvPSettlements);
    });
  }
);
