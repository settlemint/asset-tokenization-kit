import "server-only";

import { fetchAllTheGraphPages } from "@/lib/pagination";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse, t } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import type { Address } from "viem";
import { calculateActions } from "./action-calculated";
import { ActionFragment } from "./actions-fragment";
import { OnchainActionSchema } from "./actions-schema";

/**
 * GraphQL query to fetch actions for user
 */
const Actions = theGraphGraphqlKit(
  `
  query Actions($first: Int, $skip: Int, $where: Action_filter) {
    actions(
      first: $first
      skip: $skip
      where: $where
    ) {
      ...ActionFragment
    }
  }
`,
  [ActionFragment]
);

/**
 * Props interface for actions for user list components
 */
export interface ActionsForTargetProps {
  target: Address;
}

/**
 * Fetches and processes actions for a user
 *
 * @param params - Object containing user address and optional limit
 * @returns Array of normalized action executors with actions
 */
export const getActionsForTarget = withTracing(
  "queries",
  "getActionsForTarget",
  cache(async ({ target }: ActionsForTargetProps) => {
    "use cache";
    cacheTag("actions");

    const onchainActions = await fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientKit.request(
        Actions,
        {
          first,
          skip,
          where: {
            target: target.toLowerCase(),
          },
        },
        {
          "X-GraphQL-Operation-Name": "Actions",
          "X-GraphQL-Operation-Type": "query",
        }
      );

      const actions = result.actions || [];
      return safeParse(t.Array(OnchainActionSchema), actions);
    });

    return calculateActions(onchainActions);
  })
);
