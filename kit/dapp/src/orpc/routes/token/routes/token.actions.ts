import { calculateActionStatus } from "@/lib/constants/action-types";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import {
  ActionStatusEnum,
  TokenActionsResponseSchema,
  type TokenAction,
} from "@/orpc/routes/token/routes/token.actions.schema";
import { TRPCError } from "@trpc/server";

/**
 * GraphQL query for retrieving token actions from TheGraph.
 *
 * Actions represent pending, upcoming, completed, or expired operations
 * that need to be executed by authorized users (executors) on specific tokens.
 * Examples include settlement approvals, XvP executions, and bond maturations.
 *
 * This query supports:
 * - Filtering by token ID (target address)
 * - Filtering by action status (pending, upcoming, completed, expired)
 * - Filtering by action type (Admin, User)
 * - Filtering by user address (executor)
 * - Paginated retrieval using skip/first parameters
 *
 * @remarks
 * The subgraph indexes all actions created through the actions system,
 * tracking their lifecycle from creation to execution or expiration.
 */
const LIST_TOKEN_ACTIONS_QUERY = theGraphGraphql(`
  query ListTokenActionsQuery($skip: Int!, $first: Int!, $where: Action_filter) {
    actions(
      where: $where
      skip: $skip
      first: $first
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      name
      type
      createdAt
      activeAt
      expiresAt
      executedAt
      executed
      target {
        id
      }
      executedBy {
        id
      }
    }
  }
`);

/**
 * Token actions listing route handler.
 *
 * Retrieves a paginated list of actions related to tokens in the system.
 * This endpoint provides visibility into pending operations, completed tasks,
 * and expired actions for token management and compliance workflows.
 *
 * Authentication: Required (uses token router with wallet verification)
 * Permissions: Requires onboarded user with wallet
 * Method: GET /token/actions
 *
 * @param input - List parameters including pagination and filtering
 * @param context - Request context with TheGraph client and authenticated user
 * @returns Promise<TokenAction[]> - Array of action objects with metadata
 * @throws NOT_ONBOARDED - If user is not onboarded or lacks a wallet
 * @throws FORBIDDEN - If user lacks required read permissions
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get all pending actions
 * const pendingActions = await orpc.token.actions.query({
 *   status: 'PENDING'
 * });
 *
 * // Get actions for a specific token
 * const tokenActions = await orpc.token.actions.query({
 *   tokenId: '0x123...',
 *   limit: 50
 * });
 *
 * // Get actions executable by a specific user
 * const userActions = await orpc.token.actions.query({
 *   userAddress: '0xabc...',
 *   status: 'PENDING'
 * });
 * ```
 *
 * @see {@link TokenActionsListSchema} for the response structure
 * @see {@link TokenActionsInputSchema} for input parameters
 */
export const actions = authRouter.token.actions
  .use(theGraphMiddleware)
  .handler(async ({ input, context }) => {
    // SECURITY: Auto-filter to user's wallet address, with admin override
    const targetUserAddress =
      context.auth.user.role === "admin" && input.userAddress
        ? input.userAddress
        : context.auth.user.wallet;

    // SECURITY: Prevent enumeration - only admins can query other users
    if (
      input.userAddress &&
      input.userAddress !== context.auth.user.wallet &&
      context.auth.user.role !== "admin"
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "Cannot query actions for other users without admin permission",
      });
    }

    // Build where clause for filtering
    const where: Record<string, unknown> = {};

    // Filter by token ID (target address)
    if (input.tokenId !== undefined) {
      where.target = input.tokenId.toLowerCase();
    }

    // SECURITY: Always filter by user address to prevent unauthorized access
    where.executor_ = {
      executors_contains: [targetUserAddress.toLowerCase()],
    };

    // Filter by action type
    if (input.type !== undefined) {
      where.type = input.type;
    }

    // Filter by status based on timestamps and execution state
    if (input.status !== undefined) {
      const nowSeconds = Math.floor(Date.now() / 1000);

      switch (input.status) {
        case ActionStatusEnum.enum.PENDING:
          where.executed = false;
          where.activeAt_lte = nowSeconds;
          where.expiresAt_gt = nowSeconds;
          break;
        case ActionStatusEnum.enum.UPCOMING:
          where.executed = false;
          where.activeAt_gt = nowSeconds;
          break;
        case ActionStatusEnum.enum.COMPLETED:
          where.executed = true;
          break;
        case ActionStatusEnum.enum.EXPIRED:
          where.executed = false;
          where.expiresAt_lte = nowSeconds;
          break;
      }
    }

    // Query TheGraph for actions with security limits
    const response = await context.theGraphClient.query(
      LIST_TOKEN_ACTIONS_QUERY,
      {
        input: {
          skip: input.offset,
          first: input.limit ? Math.min(input.limit, 1000) : 50, // Default to 50 for better performance
          where: Object.keys(where).length > 0 ? where : undefined,
        },
        output: TokenActionsResponseSchema,
        error: "Failed to list token actions",
      }
    );

    // SECURITY: Transform response with computed status and filtered data
    const actionsWithStatus: TokenAction[] = response.actions.map((action) => {
      const status = calculateActionStatus(
        action.activeAt.getTime() / 1000, // Convert Date to seconds
        action.expiresAt ? action.expiresAt.getTime() / 1000 : null,
        action.executed
      );

      // SECURITY: Only return minimal necessary information
      return {
        id: action.id,
        name: action.name,
        type: action.type,
        status,
        createdAt: action.createdAt,
        activeAt: action.activeAt,
        expiresAt: action.expiresAt,
        executedAt: action.executedAt,
        executed: action.executed,
        target: action.target,
        executedBy: action.executedBy,
      };
    });

    return actionsWithStatus;
  });
