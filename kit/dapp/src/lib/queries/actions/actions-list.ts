import "server-only";

import { fetchAllTheGraphPages } from "@/lib/pagination";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import { getTranslations } from "next-intl/server";
import { cache } from "react";
import type { Address } from "viem";
import { ActionExecutorFragment } from "./actions-fragment";
import {
  ActionExecutorList,
  ActionsListSchema,
  ActionType,
} from "./actions-schema";

/**
 * GraphQL query to fetch actions for user
 */
const Actions = theGraphGraphqlKit(
  `
  query Actions($first: Int, $skip: Int, $where: ActionExecutor_filter) {
    actionExecutors(
      first: $first
      skip: $skip
      where: $where
    ) {
      ...ActionExecutorFragment
    }
  }
`,
  [ActionExecutorFragment]
);

/**
 * Props interface for actions for user list components
 */
export interface ActionsListProps {
  /** User wallet address to filter by */
  userAddress: Address;
  /** Action type to filter by */
  actionType: ActionType;
  /** Whether to filter by executed actions */
  executed: boolean;
  /** Whether to filter by active actions */
  active?: boolean;
}

/**
 * Fetches and processes actions for a user
 *
 * @param params - Object containing user address and optional limit
 * @returns Array of normalized action executors with actions
 */
export const getActionsList = withTracing(
  "queries",
  "getActionsList",
  cache(
    async ({ userAddress, actionType, executed, active }: ActionsListProps) => {
      // "use cache";
      // cacheTag("actions");

      const actionExecutors = await fetchAllTheGraphPages(
        async (first, skip) => {
          const result = await theGraphClientKit.request(
            Actions,
            {
              first,
              skip,
              where: {
                executors_: {
                  id_contains: userAddress.toLowerCase(),
                },
                actions_: {
                  type: actionType,
                  executed,
                  ...(active === true
                    ? { activeAt_lte: (new Date().getTime() / 1000).toFixed(0) }
                    : {}),
                  ...(active === false
                    ? { activeAt_gt: (new Date().getTime() / 1000).toFixed(0) }
                    : {}),
                },
              },
            },
            {
              "X-GraphQL-Operation-Name": "ActionsForUser",
              "X-GraphQL-Operation-Type": "query",
            }
          );

          const actionExecutors = result.actionExecutors || [];

          return actionExecutors;
        }
      );

      const validatedActionExecutors = safeParse(
        ActionExecutorList,
        actionExecutors
      );

      const actions = validatedActionExecutors.flatMap(
        (actionExecutor) => actionExecutor.actions
      );
      const t = await getTranslations("actions");
      const actionsWithNames = actions.map((action) => ({
        ...action,
        name: t(`name.${action.name}`), // TODO: do this in the table for events and actions?
      }));

      return safeParse(ActionsListSchema, actionsWithNames);
    }
  )
);
