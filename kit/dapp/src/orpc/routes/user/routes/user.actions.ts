import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { z } from "zod";
import {
  type Action,
  type ActionStatus,
  type ActionType,
  type UserActionsOutput,
  ActionStatusSchema,
  ActionTypeSchema,
} from "./user.actions.schema";

const logger = createLogger();

/**
 * GraphQL query for retrieving actions assigned to a specific user.
 *
 * This query fetches actions directly with their executor information
 * for more efficient querying and filtering based on user wallet address.
 */
const LIST_USER_ACTIONS_QUERY = theGraphGraphql(`
  query ListUserActionsQuery(
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
 * GraphQL query for counting total actions assigned to a specific user
 */
const COUNT_USER_ACTIONS_QUERY = theGraphGraphql(`
  query CountUserActionsQuery($where: Action_filter) {
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
  subgraphAction: z.infer<typeof ActionsResponseSchema>["actions"][0]
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
    subgraphAction.type.toUpperCase() === "ADMIN"
      ? ActionTypeSchema.enum.ADMIN
      : ActionTypeSchema.enum.USER;

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
    assignedTo:
      subgraphAction.executors.executors.length > 0 &&
      subgraphAction.executors.executors[0]
        ? subgraphAction.executors.executors[0].id
        : null,
    token: subgraphAction.target.id,
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
 * Builds GraphQL where clause based on filter criteria and user wallet address
 */
function buildWhereClause(
  userWallet: string,
  status?: ActionStatus,
  type?: ActionType,
  assignedTo?: string
): Record<string, unknown> {
  const where: Record<string, unknown> = {
    // Filter by user wallet address - query actions where executors contain this address
    executors_: {
      executors_contains: [userWallet.toLowerCase()],
    },
  };

  // If assignedTo is provided, ensure it matches the authenticated user's wallet
  // This prevents unauthorized access to other users' actions
  if (assignedTo) {
    if (assignedTo.toLowerCase() !== userWallet.toLowerCase()) {
      // Security: Don't allow querying actions assigned to other users
      // Return a filter that will match no results
      where.id = "nonexistent";
    }
  }

  // Filter by type
  if (type) {
    if (type === ActionTypeSchema.enum.ADMIN) {
      where.type_in = ["ADMIN", "Admin"];
    } else {
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
    } else {
      where.executed = false;
      where.activeAt_lte = currentTimestamp;
    }
  }

  return where;
}

export const actions = authRouter.user.actions
  .use(theGraphMiddleware)
  .handler(async ({ input, context }) => {
    const { auth } = context;
    const { status, type, assignedTo, limit, offset } = input;

    logger.info("Fetching actions for user", {
      userWallet: auth.user.wallet,
      status,
      type,
      assignedTo,
      limit,
      offset,
    });

    try {
      // Build where clause for the GraphQL query
      const where = buildWhereClause(
        auth.user.wallet,
        status,
        type,
        assignedTo
      );

      // Get total count first
      const countResponse = await context.theGraphClient.query(
        COUNT_USER_ACTIONS_QUERY,
        {
          input: {
            where: Object.keys(where).length > 0 ? where : undefined,
          },
          output: CountResponseSchema,
          error: "Failed to count user actions",
        }
      );

      const total = countResponse.actions.length;

      // Get paginated results
      const response = await context.theGraphClient.query(
        LIST_USER_ACTIONS_QUERY,
        {
          input: {
            skip: offset,
            first: Math.min(limit, 1000),
            orderBy: "createdAt",
            orderDirection: "desc",
            where: Object.keys(where).length > 0 ? where : undefined,
          },
          output: ActionsResponseSchema,
          error: "Failed to fetch user actions",
        }
      );

      // Process actions
      const actions: Action[] = response.actions.map(mapSubgraphActionToAction);

      const result: UserActionsOutput = {
        actions,
        total,
        hasMore: offset + actions.length < total,
      };

      logger.info("Successfully fetched user actions", {
        count: result.actions.length,
        total: result.total,
        hasMore: result.hasMore,
      });

      return result;
    } catch (error) {
      logger.error("Error fetching user actions", { error });

      // Return empty result on error to prevent UI breaking
      return {
        actions: [],
        total: 0,
        hasMore: false,
      };
    }
  });
