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
import { ActionExecutorFragment } from "./actions-fragment";
import {
  ActionType,
  OnchainActionExecutorSchema,
  type ActionStatus,
  type OnchainAction,
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
  type: ActionType;
  /** Whether to filter by executed actions */
  status?: ActionStatus;
  /** Target address to filter by */
  targetAddress?: Address;
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
    async ({ userAddress, type, status, targetAddress }: ActionsListProps) => {
      "use cache";
      cacheTag("actions");

      const nowSeconds = (new Date().getTime() / 1000).toFixed(0);

      const where = {
        PENDING: {
          executed: false,
          activeAt_lte: nowSeconds,
          expiresAt_gt: nowSeconds,
        },
        UPCOMING: {
          executed: false,
          activeAt_gt: nowSeconds,
        },
        COMPLETED: {
          executed: true,
        },
        EXPIRED: {
          executed: false,
          expiresAt_lte: nowSeconds,
        },
      };
      const actionExecutors = await fetchAllTheGraphPages(
        async (first, skip) => {
          // Create the request parameters
          const params = {
            first,
            skip,
          } as any; // Use type assertion to bypass TypeScript checking

          // Add the where clause with type assertion
          params.where = {
            executors_: {
              id_contains: userAddress.toLowerCase(),
            },
            actions_: {
              type,
              ...(status ? where[status] : {}),
              ...(targetAddress ? { target: targetAddress } : {}),
            },
          };

          const result = await theGraphClientKit.request(Actions, params, {
            "X-GraphQL-Operation-Name": "ActionExecutors",
            "X-GraphQL-Operation-Type": "query",
          });

          const actionExecutors = result.actionExecutors || [];
          return safeParse(
            t.Array(OnchainActionExecutorSchema),
            actionExecutors
          );
        }
      );

      const onchainActions = actionExecutors.flatMap(
        (actionExecutor) => actionExecutor.actions
      ) as OnchainAction[];

      return calculateActions(onchainActions);
    }
  )
);
