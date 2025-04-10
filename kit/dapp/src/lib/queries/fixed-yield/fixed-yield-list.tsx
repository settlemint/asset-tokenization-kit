"use server";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse, t } from "@/lib/utils/typebox";
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
export const getFixedYieldList = withTracing(
  "queries",
  "getFixedYieldList",
  cache(async () => {
    const data = await theGraphClientKit.request(FixedYieldListQuery);

    if (!data.fixedYields?.length) {
      return [];
    }

    return safeParse(t.Array(FixedYieldFragmentSchema), data.fixedYields || []);
  })
);
