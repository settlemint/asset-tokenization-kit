import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { SystemsResponseSchema } from "@/orpc/routes/system/routes/system.list.schema";

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
  query ListSystemQuery($skip: Int!, $first: Int!, $orderBy: System_orderBy, $orderDirection: OrderDirection) {
    systems(
        skip: $skip
        first: $first
        orderBy: $orderBy
        orderDirection: $orderDirection
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
 * @param input - List parameters including pagination and sorting options
 * @param context - Request context with TheGraph client and authenticated user
 * @returns Promise<System[]> - Array of system objects with their blockchain addresses
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions
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
    // Execute TheGraph query with automatic variable transformation
    // The middleware handles offset/limit to skip/first conversion
    const result = await context.theGraphClient.query(LIST_SYSTEM_QUERY, {
      input: { input },
      output: SystemsResponseSchema,
      error: "Failed to retrieve systems",
    });

    // Return the array of system contracts
    return result.systems;
  });
