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
 * GraphQL query for retrieving actions directly from TheGraph.
 *
 * This query fetches actions directly with their executor information
 * for more efficient querying and filtering.
 */
const LIST_ACTIONS_QUERY = theGraphGraphql(`
  query ListActionsQuery(
    $skip: Int!
    $first: Int!
    $orderBy: Action_orderBy
    $orderDirection: OrderDirection
    $where: Action_filter
  ) {
    actions(
      where: $where
      skip: $skip
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
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
      executors {
        id
        executors {
          id
        }
      }
    }
  }
`);

// Schema for the GraphQL response
const ActionsResponseSchema = z.object({
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
      executors: z.object({
        id: z.string(),
        executors: z.array(z.object({ id: z.string() })),
      }),
    })
  ),
});

/**
 * Maps subgraph action fields to the frontend action model
 */
function mapSubgraphActionToAction(
  subgraphAction: z.infer<typeof ActionsResponseSchema>["actions"][0],
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

  // Map type - normalize to uppercase and handle both Admin/ADMIN variations
  const type: ActionType =
    subgraphAction.type.toUpperCase() === "ADMIN" ? "ADMIN" : "USER";

  // Generate description based on action name and context
  const description = generateActionDescription(
    subgraphAction.name,
    subgraphAction.type,
    subgraphAction.requiredRole
  );

    return {
    id: subgraphAction.id,
    type,
    status,
    title: formatActionTitle(subgraphAction.name),
    description,
    dueDate: expiresAt,
    createdAt: Number(subgraphAction.createdAt),
    updatedAt: subgraphAction.executedAt
      ? Number(subgraphAction.executedAt)
      : Number(subgraphAction.createdAt),
    assignedTo: subgraphAction.executors?.executors?.length > 0
      ? subgraphAction.executors.executors[0]?.id ?? null
      : null,
    token: tokenId,
    metadata: subgraphAction.requiredRole
      ? [{ key: "requiredRole", value: subgraphAction.requiredRole }]
      : undefined,
  };
}

/**
 * Generates a human-readable description based on action name and context
 */
function generateActionDescription(
  name: string,
  type: string,
  requiredRole?: string | null
): string {
  const roleContext = requiredRole ? ` (requires ${requiredRole} role)` : "";

  switch (name) {
    case "ApproveXvPSettlement":
      return `Approve the cross-venue payment settlement${roleContext}`;
    case "ExecuteXvPSettlement":
      return `Execute the cross-venue payment settlement after all approvals${roleContext}`;
    case "MatureBond":
      return `Process bond maturation and distribute final payments${roleContext}`;
    default:
      return `${type} action: ${name}${roleContext}`;
  }
}

/**
 * Formats action names for better display
 */
function formatActionTitle(name: string): string {
  switch (name) {
    case "ApproveXvPSettlement":
      return "Approve XvP Settlement";
    case "ExecuteXvPSettlement":
      return "Execute XvP Settlement";
    case "MatureBond":
      return "Mature Bond";
    default:
      // Convert camelCase to Title Case
      return name
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
  }
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
      const where: Record<string, unknown> = {
        // Filter by token target directly in the query
        target: token.id.toLowerCase(),
      };

      // Filter by assignedTo - query actions where executors contain this address
      if (assignedTo) {
        where.executors_ = {
          executors_contains: [assignedTo.toLowerCase()],
        };
      }

      const response = await context.theGraphClient.query(LIST_ACTIONS_QUERY, {
        input: {
          skip: offset,
          first: Math.min(limit, 1000),
          orderBy: "createdAt",
          orderDirection: "desc",
          where: Object.keys(where).length > 0 ? where : undefined,
        },
        output: ActionsResponseSchema,
        error: "Failed to fetch actions",
      });

      // Process actions directly
      const allActions: Action[] = [];

      for (const action of response.actions) {
        const mappedAction = mapSubgraphActionToAction(action, token.id);

        // Apply additional filters (token filtering is done in GraphQL query)
        if (
          (!type || mappedAction.type === type) &&
          (!status || mappedAction.status === status)
        ) {
          allActions.push(mappedAction);
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
