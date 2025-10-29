import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { authRouter } from "@/orpc/procedures/auth.router";
import type { VariablesOf } from "@settlemint/sdk-thegraph";
import { getUnixTime } from "date-fns";
import { z } from "zod";
import {
  ActionSchema,
  type ActionsListResponse,
  type ActionStatus,
} from "./actions.list.schema";

/**
 * GraphQL query for retrieving all actions from TheGraph.
 *
 * Actions represent time-bound, executable tasks that users can perform on assets.
 * Each action has specific executors (authorized addresses), timing constraints,
 * and target addresses. Actions are automatically filtered to only include those
 * accessible to the authenticated user.
 *
 * This query supports:
 * - Filtering by status, target address, required role, and name
 * - User-scoped results (only actions the user can execute)
 *
 * @remarks
 * The subgraph indexes all actions with their current status and executor information.
 * Actions are automatically filtered by the user's address in the executors list.
 */
const LIST_ACTIONS_QUERY = theGraphGraphql(`
  query ListActionsQuery($where: Action_filter) {
    actions(where: $where) @fetchAll {
        id
        name
        target
        activeAt
        executed
        expiresAt
        executedAt
        executedBy
        executor {
          id
          executors
        }
      }
    }
  `);

/**
 * Schema for the response from the GraphQL query.
 */
const ActionsGraphResponseSchema = z.array(
  ActionSchema.omit({ status: true }).extend({ executed: z.boolean() })
);

/**
 * Type for the response from the GraphQL query.
 */
type ActionsGraphResponse = z.infer<typeof ActionsGraphResponseSchema>;

/**
 * Actions listing route handler.
 *
 * Retrieves all actions accessible to the authenticated user.
 * Actions are automatically filtered to only include those where the user is
 * listed as an authorized executor. Additional filtering is available by status,
 * target address, required role, and action name.
 *
 * Authentication: Required (uses authenticated router)
 * Method: GET /actions/list
 *
 * @param input - Filter parameters
 * @param context - Request context with TheGraph client and authenticated user
 * @returns Promise<ActionsListResponse> - List of user's actions
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get all pending actions for the current user
 * const actions = await orpc.actions.list.query({
 *   status: 'PENDING'
 * });
 *
 * // Get actions targeting a specific address
 * const tokenActions = await orpc.actions.list.query({
 *   target: '0x1234567890123456789012345678901234567890'
 * });
 * ```
 *
 * @see {@link ActionsListSchema} for the input parameters
 * @see {@link ActionsListResponse} for the response structure
 */
export const list = authRouter.actions.list.handler(
  async ({ input, context }): Promise<ActionsListResponse> => {
    // Build where clause with user filtering and optional filters
    let where: VariablesOf<typeof LIST_ACTIONS_QUERY>["where"] = {
      // Filter actions to only those where the user is an authorized executor
      executor_: {
        executors_contains: [context.auth.user.wallet.toLowerCase()],
      },
    };

    // Apply optional filters
    const now = new Date();
    const nowUnixTime = getUnixTime(now).toString();
    switch (input.status) {
      case "PENDING":
        where = {
          and: [
            { ...where }, // Include existing where clause
            { executed: false },
            { activeAt_lte: nowUnixTime },
            {
              or: [
                {
                  expiresAt_gt: nowUnixTime,
                },
                {
                  expiresAt: null,
                },
              ],
            },
          ],
        };
        break;
      case "UPCOMING":
        where = {
          and: [
            { ...where }, // Include existing where clause
            { executed: false },
            { activeAt_gt: nowUnixTime },
            {
              or: [
                {
                  expiresAt_gt: nowUnixTime,
                },
                {
                  expiresAt: null,
                },
              ],
            },
          ],
        };
        break;
      case "EXECUTED":
        where.executed = true;
        break;
      case "EXPIRED":
        where.expiresAt_lte = nowUnixTime;
        where.executed = false;
        break;
    }

    if (Array.isArray(input.targets) && input.targets.length > 0) {
      where.target_in = input.targets.map((target) => target.toLowerCase());
    }
    if (input.name !== undefined) {
      where.name_contains_nocase = input.name;
    }

    // Execute query
    const response = await context.theGraphClient.query(LIST_ACTIONS_QUERY, {
      input: { where },
      output: z.object({
        actions: ActionsGraphResponseSchema,
      }),
    });

    return response.actions.map((action) => {
      const { executed: _, ...rest } = action;
      return {
        ...rest,
        status: getActionStatus(action, now),
      };
    });
  }
);

function getActionStatus(
  action: ActionsGraphResponse[number],
  now: Date
): ActionStatus {
  if (action.executed) {
    return "EXECUTED";
  }
  if (action.expiresAt && action.expiresAt.getTime() <= now.getTime()) {
    return "EXPIRED";
  }
  if (action.activeAt.getTime() > now.getTime()) {
    return "UPCOMING";
  }
  return "PENDING";
}
