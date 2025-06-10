import "server-only";

import { withTracing } from "@/lib/utils/sentry-tracing";
import { safeParse, t } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { FixedYieldFragmentSchema } from "./fixed-yield-fragment";

/**
 * GraphQL query to fetch all fixed yield schedules
 */
// const FixedYieldListQuery = theGraphGraphqlKit(
//   `
//   query FixedYieldList {
//     fixedYields {
//       ...FixedYieldFragment
//     }
//   }
// `,
//   [FixedYieldFragment]
// );

/**
 * Fetches a list of all fixed yield schedules
 *
 * @returns Array of fixed yield schedules or an empty array if none exist
 */
export const getFixedYieldList = withTracing(
  "queries",
  "getFixedYieldList",
  async () => {
    "use cache";
    cacheTag("asset");
    //       // const data = await theGraphClientKit.request(
    //       //       FixedYieldListQuery,
    //       //       {},
    //       //       {
    //       //         "X-GraphQL-Operation-Name": "FixedYieldList",
    //       //         "X-GraphQL-Operation-Type": "query",
    //       //       }
    //       //     );

    // if (!data.fixedYields?.length) {
    //   return [];
    // }

    return safeParse(t.Array(FixedYieldFragmentSchema), []);
  }
);
