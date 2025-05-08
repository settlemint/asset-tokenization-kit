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
import {
  BondMaturedEventFragment,
  BondMaturedEventSchema,
} from "./bond-matured-fragment";

const BondMaturedEventList = theGraphGraphqlKit(
  `
  query BondMaturedEventList($first: Int, $skip: Int) {
    activityLogEntries(first: $first, skip: $skip, where: {eventName: "BondMatured"}) {
      ...BondMaturedEventFragment
    }
  }
`,
  [BondMaturedEventFragment]
);

export const getBondMaturedEventList = withTracing(
  "queries",
  "getBondMaturedEventList",
  async () => {
    "use cache";
    cacheTag("asset");
    const bondMaturedEvents = await fetchAllTheGraphPages(
      async (first, skip) => {
        const result = await theGraphClientKit.request(BondMaturedEventList, {
          first,
          skip,
        });

        return safeParse(
          t.Array(BondMaturedEventSchema),
          result.activityLogEntries || []
        );
      }
    );

    return bondMaturedEvents;
  }
);
