import "server-only";

import type { CurrencyCode } from "@/lib/db/schema-settings";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import { ApiError } from "next/dist/server/api-utils";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { calculateXvPSettlement } from "./xvp-calculated";
import { XvPSettlementFragment } from "./xvp-fragment";
import { OnChainXvPSettlementSchema, type XvPSettlement } from "./xvp-schema";

/**
 * GraphQL query to fetch XvPSettlement from The Graph
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
 * Fetches a single XvPSettlement from The Graph and enriches it.
 *
 * @remarks
 * This function fetches data from The Graph and returns an enriched XvP settlement.
 */
export const getXvPSettlementDetail = withTracing(
  "queries",
  "getXvPSettlementDetail",
  async (
    id: string,
    userCurrency: CurrencyCode
  ): Promise<XvPSettlement | null> => {
    "use cache";
    cacheTag("trades");

    const result = await theGraphClientKit.request(XvPSettlementDetail, {
      id,
    });

    const onChainSettlement = safeParse(
      OnChainXvPSettlementSchema,
      result.xvPSettlement
    );

    if (!onChainSettlement) {
      throw new ApiError(404, "XvPSettlement not found");
    }

    return calculateXvPSettlement(onChainSettlement, userCurrency);
  }
);
