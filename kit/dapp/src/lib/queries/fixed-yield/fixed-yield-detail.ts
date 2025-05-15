import "server-only";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import type { Address } from "viem";
import {
  FixedYieldFragment,
  FixedYieldFragmentSchema,
} from "./fixed-yield-fragment";

/**
 * GraphQL query to fetch fixed yield schedule details by ID
 */
const FixedYieldDetailQuery = theGraphGraphqlKit(
  `
  query FixedYieldDetail($id: ID!) {
    fixedYield(id: $id) {
      ...FixedYieldFragment
    }
  }
`,
  [FixedYieldFragment]
);

interface GetFixedYieldDetailParams {
  address: Address;
}

/**
 * Fetches detailed information about a specific fixed yield schedule
 *
 * @param params - Object containing the fixed yield address
 * @returns Fixed yield schedule details or null if not found
 */
export const getFixedYieldDetail = withTracing(
  "queries",
  "getFixedYieldDetail",
  async ({ address }: GetFixedYieldDetailParams) => {
    "use cache";
    cacheTag("asset");
    const data = await theGraphClientKit.request(FixedYieldDetailQuery, {
      id: address,
    });

    if (!data.fixedYield) {
      return null;
    }

    return safeParse(FixedYieldFragmentSchema, data.fixedYield);
  }
);
