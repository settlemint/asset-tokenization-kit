import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { TokenActionsResponseSchema } from "@/orpc/routes/token/routes/token.actions.schema";

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
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "read" permission on tokens
 * Method: GET /token/actions
 *
 * @param input - List parameters including pagination and filtering
 * @param context - Request context with TheGraph client and authenticated user
 * @returns Promise<TokenAction[]> - Array of action objects with metadata
 * @throws UNAUTHORIZED - If user is not authenticated
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
    // Build where clause for filtering
    const where: Record<string, unknown> = {};
    
    // Filter by token ID (target address)
    if (input.tokenId !== undefined) {
      where.target = input.tokenId.toLowerCase();
    }
    
    // Filter by user address (executor)
    if (input.userAddress !== undefined) {
      where.executors_ = {
        id_contains: input.userAddress.toLowerCase(),
      };
    }
    
    // Filter by action type
    if (input.type !== undefined) {
      where.type = input.type;
    }
    
    // Filter by status based on timestamps and execution state
    if (input.status !== undefined) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      
      switch (input.status) {
        case "PENDING":
          where.executed = false;
          where.activeAt_lte = nowSeconds;
          where.expiresAt_gt = nowSeconds;
          break;
        case "UPCOMING":
          where.executed = false;
          where.activeAt_gt = nowSeconds;
          break;
        case "COMPLETED":
          where.executed = true;
          break;
        case "EXPIRED":
          where.executed = false;
          where.expiresAt_lte = nowSeconds;
          break;
      }
    }

    // Query TheGraph for actions
    const response = await context.theGraphClient.query(LIST_TOKEN_ACTIONS_QUERY, {
      input: {
        skip: input.offset,
        first: input.limit ? Math.min(input.limit, 1000) : 1000,
        where: Object.keys(where).length > 0 ? where : undefined,
      },
      output: TokenActionsResponseSchema,
      error: "Failed to list token actions",
    });

    return response.actions;
  });