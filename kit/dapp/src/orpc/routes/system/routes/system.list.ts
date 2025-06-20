import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";

/**
 * GraphQL query for retrieving SMART systems from TheGraph.
 *
 * This query fetches a paginated list of system contracts with support for:
 * - Offset-based pagination (skip/first)
 * - Configurable sort order (ascending/descending)
 * - Custom ordering by any system field
 *
 * Systems represent deployed SMART protocol instances that manage
 * tokenized assets and their associated compliance infrastructure.
 */
const LIST_SYSTEM_QUERY = theGraphGraphql(`
  query ListSystemQuery($skip: Int!, $orderDirection: OrderDirection = asc, $first: Int = 20) {
    systems(
        first: $first
        orderDirection: $orderDirection
        skip: $skip
      ) {
      id
    }
  }
`);

/**
 * System listing route handler.
 *
 * Retrieves a paginated list of SMART system contracts from TheGraph indexer.
 * Systems are the core infrastructure contracts that manage tokenized assets,
 * compliance modules, identity registries, and access control within the SMART
 * protocol ecosystem.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "read" permission - available to admin, issuer, user, and auditor roles
 * Method: GET /systems
 *
 * @param input - List parameters including pagination and sorting options
 * @param context - Request context with TheGraph client and authenticated user
 * @returns Promise<System[]> - Array of system objects with their blockchain addresses
 *
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions
 *
 * @example
 * ```typescript
 * // Client usage:
 * const systems = await orpc.system.list.query({
 *   offset: 0,
 *   limit: 20,
 *   orderBy: 'deployedAt',
 *   orderDirection: 'desc'
 * });
 * ```
 */
export const list = authRouter.system.list
  .use(theGraphMiddleware)
  .handler(async ({ input, context }) => {
    // TODO: Not happy about this
    // Extract and validate pagination parameters from the request
    const { offset, limit, orderDirection } = input ?? {
      offset: 0,
      limit: 20,
      orderDirection: "asc",
    };

    // Execute TheGraph query with pagination and sorting parameters
    const { systems } = await context.theGraphClient.request(
      LIST_SYSTEM_QUERY,
      {
        skip: offset,
        orderDirection,
        first: limit,
      }
    );

    // Return the array of system contracts
    return systems;
  });
