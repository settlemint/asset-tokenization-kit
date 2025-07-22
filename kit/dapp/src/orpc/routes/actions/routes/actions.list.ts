import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import type { VariablesOf } from "@settlemint/sdk-thegraph";
import {
  ActionsResponseSchema,
  type ActionsListResponse,
} from "./actions.list.schema";

// Configuration constants
const MAX_ACTIONS_PER_REQUEST = 1000;
const DEFAULT_PAGE_SIZE = 10;

/**
 * GraphQL query for retrieving actions from TheGraph.
 *
 * Actions represent time-bound, executable tasks that users can perform on assets.
 * Each action has specific executors (authorized addresses), timing constraints,
 * and target addresses. Actions are automatically filtered to only include those
 * accessible to the authenticated user.
 *
 * This query supports:
 * - Paginated retrieval using skip/first parameters
 * - Flexible sorting by any Action field (createdAt, activeAt, etc.)
 * - Filtering by status, target address, required role, and name
 * - User-scoped results (only actions the user can execute)
 *
 * @remarks
 * The subgraph indexes all actions with their current status and executor information.
 * Actions are automatically filtered by the user's address in the executors list.
 */
const LIST_ACTIONS_QUERY = theGraphGraphql(`
  query ListActionsQuery($skip: Int!, $first: Int!, $orderBy: Action_orderBy, $orderDirection: OrderDirection, $where: Action_filter) {
    actions(
        where: $where
        skip: $skip
        first: $first
        orderBy: $orderBy
        orderDirection: $orderDirection
      ) {
        id
        name
        target
        createdAt
        activeAt
        expiresAt
        requiredRole
        status
        executed
        executedAt
        executedBy
        identifier
        executor {
          id
          executors
        }
      }
    }
  `);

/**
 * GraphQL query for counting total actions matching the filter.
 * Used to provide accurate pagination metadata.
 *
 * Note: This query fetches all matching actions to count them accurately.
 * For production systems with very large datasets, consider implementing a dedicated
 * count field in the subgraph schema for better performance.
 */
const COUNT_ACTIONS_QUERY = theGraphGraphql(`
  query CountActionsQuery($where: Action_filter) {
    actions(where: $where) {
      id
    }
  }`);

/**
 * Actions listing route handler.
 *
 * Retrieves a paginated list of actions accessible to the authenticated user.
 * Actions are automatically filtered to only include those where the user is
 * listed as an authorized executor. Additional filtering is available by status,
 * target address, required role, and action name.
 *
 * Authentication: Required (uses authenticated router)
 * Method: GET /actions/list
 *
 * @param input - List parameters including pagination, sorting, and filtering
 * @param context - Request context with TheGraph client and authenticated user
 * @returns Promise<ActionsListResponse> - Paginated list of user's actions
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
 *
 * // Get second page of actions (20 per page)
 * const page2 = await orpc.actions.list.query({
 *   offset: 20,
 *   limit: 20
 * });
 * ```
 *
 * @see {@link ActionsListSchema} for the input parameters
 * @see {@link ActionsListResponse} for the response structure
 */
export const list = authRouter.actions.list
  .use(theGraphMiddleware)
  .handler(async ({ input, context }): Promise<ActionsListResponse> => {
    // Build where clause with user filtering and optional filters
    const where: VariablesOf<typeof LIST_ACTIONS_QUERY>["where"] = {
      // Filter actions to only those where the user is an authorized executor
      executor_: {
        executors_contains: [context.auth.user.wallet.toLowerCase()],
      },
    };

    // Apply optional filters
    if (input.status !== undefined) {
      where.status = input.status;
    }
    if (input.target !== undefined) {
      where.target = input.target.toLowerCase();
    }
    if (input.requiredRole !== undefined) {
      where.requiredRole = input.requiredRole;
    }
    if (input.name !== undefined) {
      where.name_contains_nocase = input.name;
    }

    // Execute both queries in parallel for performance
    const [response, countResponse] = await Promise.all([
      // Get paginated data
      context.theGraphClient.query(LIST_ACTIONS_QUERY, {
        input: {
          skip: input.offset,
          first: input.limit
            ? Math.min(input.limit, MAX_ACTIONS_PER_REQUEST)
            : DEFAULT_PAGE_SIZE,
          orderBy: input.orderBy,
          orderDirection: input.orderDirection,
          where,
        },
        output: ActionsResponseSchema,
        error: "Failed to list actions",
      }),
      // Get total count for pagination metadata
      context.theGraphClient.query(COUNT_ACTIONS_QUERY, {
        input: { where },
        output: ActionsResponseSchema,
        error: "Failed to count actions",
      }),
    ]);

    // Return paginated response with accurate total count
    return {
      data: response.actions,
      total: countResponse.actions.length, // Actual total count across all pages
      offset: input.offset,
      limit: input.limit,
    };
  });
