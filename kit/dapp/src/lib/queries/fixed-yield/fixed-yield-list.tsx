import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { safeParseWithLogging } from "@/lib/utils/zod";
import { cache } from "react";
import {
  FixedYieldFragment,
  FixedYieldFragmentSchema,
} from "./fixed-yield-fragment";

/**
 * GraphQL query to fetch all fixed yield schedules
 */
const FixedYieldListQuery = theGraphGraphqlKit(
  `
  query FixedYieldList {
    fixedYields {
      ...FixedYieldFragment
    }
  }
`,
  [FixedYieldFragment]
);

/**
 * Fetches a list of all fixed yield schedules
 *
 * @returns Array of fixed yield schedules or an empty array if none exist
 */
export const getFixedYieldList = cache(async () => {
  const data = await theGraphClientKit.request(FixedYieldListQuery);

  if (!data.fixedYields?.length) {
    return [];
  }

  return data.fixedYields.map((fixedYield: unknown) =>
    safeParseWithLogging(
      FixedYieldFragmentSchema,
      fixedYield,
      "fixed yield list"
    )
  );
});
