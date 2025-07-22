import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { ORPCError } from "@orpc/server";
import { ActionSchema } from "./actions.list.schema";
import { type ActionsReadResponse } from "./actions.read.schema";

/**
 * GraphQL query for retrieving a single action from TheGraph.
 *
 * Fetches detailed information about a specific action, including its
 * executor information, timing constraints, and execution status.
 * The query includes user authorization checks to ensure the action
 * is accessible to the authenticated user.
 */
const READ_ACTION_QUERY = theGraphGraphql(`
  query ReadActionQuery($id: ID!) {
    action(id: $id) {
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
  }`);

/**
 * Action read route handler.
 *
 * Retrieves detailed information about a specific action by ID.
 * The action must be accessible to the authenticated user (user must be
 * listed as an authorized executor). This provides all the information
 * needed to display action details and determine if the action can be
 * executed by the current user.
 *
 * Authentication: Required (uses authenticated router)
 * Method: GET /actions/read
 *
 * @param input - Action ID to retrieve
 * @param context - Request context with TheGraph client and authenticated user
 * @returns Promise<ActionsReadResponse> - Complete action information
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws NOT_FOUND - If action doesn't exist or user doesn't have access
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Read a specific action
 * const action = await orpc.actions.read.query({
 *   id: '0x1234567890123456789012345678901234567890123456789012345678901234'
 * });
 *
 * // Check if action can be executed by current user
 * const canExecute = action.data.status === 'ACTIVE' &&
 *                    action.data.executor.executors.includes(userAddress);
 * ```
 *
 * @see {@link ActionsReadSchema} for the input parameters
 * @see {@link ActionsReadResponse} for the response structure
 */
export const read = authRouter.actions.read
  .use(theGraphMiddleware)
  .handler(async ({ input, context }): Promise<ActionsReadResponse> => {
    // Execute the GraphQL query
    const response = await context.theGraphClient.query(READ_ACTION_QUERY, {
      input: {
        id: input.id,
      },
      output: ActionSchema.nullable(),
      error: "Failed to read action",
    });

    // Check if action exists
    if (!response) {
      throw new ORPCError("NOT_FOUND", {
        message: "Action not found",
      });
    }

    // Check if user has access to this action (must be in executors list)
    const userHasAccess = response.executor.executors
      .map((addr) => addr.toLowerCase())
      .includes(context.auth.user.wallet.toLowerCase());

    if (!userHasAccess) {
      throw new ORPCError("NOT_FOUND", {
        message: "Action not found", // Don't reveal that it exists but user lacks access
      });
    }

    return {
      data: response,
    };
  });
