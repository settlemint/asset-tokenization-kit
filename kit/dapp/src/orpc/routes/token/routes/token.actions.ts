import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { z } from "zod/v4";
import {
  type Action,
  type ActionStatus,
  type ActionType,
  type TokenActionsOutput,
} from "./token.actions.schema";

const logger = createLogger();

/**
 * GraphQL query for retrieving action executors from TheGraph.
 *
 * Action executors contain the executors (accounts that can execute the action)
 * and the associated actions. This approach allows querying actions by executor.
 */
const LIST_ACTION_EXECUTORS_QUERY = theGraphGraphql(`
  query ListActionExecutorsQuery(
    $skip: Int!
    $first: Int!
    $orderBy: ActionExecutor_orderBy
    $orderDirection: OrderDirection
    $where: ActionExecutor_filter
  ) {
    actionExecutors(
      where: $where
      skip: $skip
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      executors {
        id
      }
      actions {
        id
        name
        type
        createdAt
        activeAt
        expiresAt
        executedAt
        executed
        executedBy {
          id
        }
        target {
          id
        }
        requiredRole
      }
    }
  }
`);

// Schema for the GraphQL response
const ActionExecutorsResponseSchema = z.object({
  actionExecutors: z.array(
    z.object({
      id: z.string(),
      executors: z.array(z.object({ id: z.string() })),
      actions: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          type: z.string(),
          createdAt: z.string(),
          activeAt: z.string(),
          expiresAt: z.string().nullable(),
          executedAt: z.string().nullable(),
          executed: z.boolean(),
          executedBy: z.object({ id: z.string() }).nullable(),
          target: z.object({ id: z.string() }),
          requiredRole: z.string().nullable(),
        })
      ),
    })
  ),
});

/**
 * Maps subgraph action fields to the frontend action model
 */
function mapSubgraphActionToAction(
  subgraphAction: z.infer<
    typeof ActionExecutorsResponseSchema
  >["actionExecutors"][0]["actions"][0],
  tokenId: string
): Action {
  // Determine status based on executed state and timestamps
  const now = Date.now() / 1000;
  const activeAt = Number(subgraphAction.activeAt);
  const expiresAt = subgraphAction.expiresAt
    ? Number(subgraphAction.expiresAt)
    : null;

  let status: ActionStatus;
  if (subgraphAction.executed) {
    status = "COMPLETED";
  } else if (activeAt > now) {
    status = "UPCOMING";
  } else {
    status = "PENDING";
  }

  // Map type - in subgraph it might be different values, so we need to normalize
  const type: ActionType = subgraphAction.type === "ADMIN" ? "ADMIN" : "USER";

  return {
    id: subgraphAction.id,
    type,
    status,
    title: subgraphAction.name,
    description: null, // Not available in subgraph
    dueDate: expiresAt,
    createdAt: Number(subgraphAction.createdAt),
    updatedAt: subgraphAction.executedAt
      ? Number(subgraphAction.executedAt)
      : Number(subgraphAction.createdAt),
    createdBy: subgraphAction.target.id, // Using target as creator for now
    assignedTo: subgraphAction.executedBy?.id ?? null,
    token: tokenId,
    metadata: subgraphAction.requiredRole
      ? [{ key: "requiredRole", value: subgraphAction.requiredRole }]
      : undefined,
  };
}

export const actions = tokenRouter.token.actions
  .use(theGraphMiddleware)
  .handler(async ({ input, context }) => {
    const { token } = context;
    const { status, type, assignedTo, limit, offset } = input;

    logger.info("Fetching actions for token", {
      tokenId: token.id,
      status,
      type,
      assignedTo,
      limit,
      offset,
    });

    try {
      // Build where clause for the GraphQL query
      const where: Record<string, unknown> = {};

      // Filter by assignedTo - query executors that contain this address
      if (assignedTo) {
        where.executors_contains = [assignedTo.toLowerCase()];
      }

      // Additional filtering will be done on actions after fetching

      const response = await context.theGraphClient.query(
        LIST_ACTION_EXECUTORS_QUERY,
        {
          input: {
            skip: offset,
            first: Math.min(limit, 1000),
            orderBy: "id",
            orderDirection: "desc",
            where: Object.keys(where).length > 0 ? where : undefined,
          },
          output: ActionExecutorsResponseSchema,
          error: "Failed to fetch actions",
        }
      );

      // Flatten all actions from all executors
      const allActions: Action[] = [];

      for (const executor of response.actionExecutors) {
        for (const action of executor.actions) {
          // Only include actions for this token
          if (action.target.id.toLowerCase() === token.id.toLowerCase()) {
            const mappedAction = mapSubgraphActionToAction(action, token.id);

            // Apply additional filters
            if (
              (!type || mappedAction.type === type) &&
              (!status || mappedAction.status === status)
            ) {
              allActions.push(mappedAction);
            }
          }
        }
      }

      // Sort by createdAt descending
      allActions.sort((a, b) => b.createdAt - a.createdAt);

      const result: TokenActionsOutput = {
        actions: allActions.slice(0, limit),
        total: allActions.length,
        hasMore: allActions.length > limit,
      };

      logger.info("Successfully fetched actions", {
        count: result.actions.length,
        hasMore: result.hasMore,
      });

      return result;
    } catch (error) {
      logger.error("Error fetching token actions", { error });

      // Return empty result on error to prevent UI breaking
      return {
        actions: [],
        total: 0,
        hasMore: false,
      };
    }
  });
