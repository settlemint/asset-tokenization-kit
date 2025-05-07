import "server-only";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { XvPSettlementFragment } from "./xvp-fragment";
import { XvPSettlementSchema } from "./xvp-schema";

/**
 * GraphQL query to fetch XvPSettlement list from The Graph
 */
const XvPSettlementDetail = theGraphGraphqlKit(
  `
  query XvPSettlement($id: ID!) {
    xvPSettlement(id: $id) {
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
export const getXvPSettlementDetail = withTracing(
  "queries",
  "getXvPSettlementDetail",
  async (id: string) => {
    "use cache";
    cacheTag("trades");

    const result = await theGraphClientKit.request(XvPSettlementDetail, {
      id,
    });

    return safeParse(XvPSettlementSchema, result.xvPSettlement);
  }
);
