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
  ActionStatusSchema,
  ActionTypeSchema,
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

/**
 * GraphQL query for counting total actions matching the filter criteria
 */
const COUNT_ACTIONS_QUERY = theGraphGraphql(`
  query CountActionsQuery($where: Action_filter) {
    actions(where: $where) {
      id
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
 * Schema for the count query response
 */
const CountResponseSchema = z.object({
  actions: z.array(z.object({ id: z.string() })),
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
    status = ActionStatusSchema.enum.COMPLETED;
  } else if (activeAt > now) {
    status = ActionStatusSchema.enum.UPCOMING;
  } else {
    status = ActionStatusSchema.enum.PENDING;
  }

  // Map type - normalize to uppercase and handle both Admin/ADMIN variations
  const type: ActionType =
    subgraphAction.type.toUpperCase() === "ADMIN" ? ActionTypeSchema.enum.ADMIN : ActionTypeSchema.enum.USER;

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

/**
 * Builds GraphQL where clause based on filter criteria
 */
function buildWhereClause(
  tokenId: string,
  status?: ActionStatus,
  type?: ActionType,
  assignedTo?: string
): Record<string, unknown> {
  const where: Record<string, unknown> = {
    // Filter by token target directly in the query
    target: tokenId.toLowerCase(),
  };

  // Filter by assignedTo - query actions where executors contain this address
  if (assignedTo) {
    where.executors_ = {
      executors_contains: [assignedTo.toLowerCase()],
    };
  }

  // Filter by type
  if (type) {
    if (type === ActionTypeSchema.enum.ADMIN) {
      where.type_in = ["ADMIN", "Admin"];
    } else if (type === ActionTypeSchema.enum.USER) {
      where.type_not_in = ["ADMIN", "Admin"];
    }
  }

  // Filter by status
  if (status) {
    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (status === ActionStatusSchema.enum.COMPLETED) {
      where.executed = true;
    } else if (status === ActionStatusSchema.enum.UPCOMING) {
      where.executed = false;
      where.activeAt_gt = currentTimestamp;
    } else if (status === ActionStatusSchema.enum.PENDING) {
      where.executed = false;
      where.activeAt_lte = currentTimestamp;
    }
  }

  return where;
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
      const where = buildWhereClause(token.id, status, type, assignedTo);

      // Get total count first
      const countResponse = await context.theGraphClient.query(COUNT_ACTIONS_QUERY, {
        input: {
          where: Object.keys(where).length > 0 ? where : undefined,
        },
        output: CountResponseSchema,
        error: "Failed to count actions",
      });

      const total = countResponse.actions.length;

      // Get paginated results
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

      // Process actions - no additional filtering needed since it's done in GraphQL
      const actions: Action[] = response.actions.map(action =>
        mapSubgraphActionToAction(action, token.id)
      );

      const result: TokenActionsOutput = {
        actions,
        total,
        hasMore: offset + actions.length < total,
      };

      logger.info("Successfully fetched actions", {
        count: result.actions.length,
        total: result.total,
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
