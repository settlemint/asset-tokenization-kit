import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { safeParseWithLogging } from "@/lib/utils/zod";
import { cache } from "react";
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
export const getFixedYieldDetail = cache(
  async ({ address }: GetFixedYieldDetailParams) => {
    const data = await theGraphClientKit.request(FixedYieldDetailQuery, {
      id: address,
    });

    if (!data.fixedYield) {
      return null;
    }

    return safeParseWithLogging(
      FixedYieldFragmentSchema,
      data.fixedYield,
      "fixed yield detail"
    );
  }
);
