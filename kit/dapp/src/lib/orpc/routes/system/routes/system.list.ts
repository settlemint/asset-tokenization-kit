import { permissionsMiddleware } from "@/lib/orpc/middlewares/auth/permissions.middleware";
import { theGraphMiddleware } from "@/lib/orpc/middlewares/services/the-graph.middleware";
import { ar } from "@/lib/orpc/routes/procedures/auth.router";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";

const listSystemQuery = theGraphGraphql(`
  query ListSystemQuery($skip: Int!, $orderDirection: OrderDirection = asc, $orderBy: System_orderBy = id, $first: Int = 20) {
    systems(
        first: $first
        orderBy: $orderBy
        orderDirection: $orderDirection
        skip: $skip
      ) {
      id
    }
  }
`);

/**
 * Planet listing route handler.
 *
 * Handles the retrieval of multiple planets with optional filtering, pagination,
 * and sorting capabilities. This handler requires authentication and processes
 * query parameters to return a filtered list of planets. The implementation
 * currently returns mock data but should be replaced with actual database queries.
 *
 * Authentication: Required (uses authenticated router)
 * API Key Permissions: Requires "read" permissions for "planet" resource
 * Method: GET /planets
 *
 * @param input - List parameters including pagination (validated against ListSchema)
 * @param context - Request context including authenticated user and database connection
 * @returns Promise<Planet[]> - Array of planet objects matching the query criteria
 *
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If API key lacks required permissions (planet: [read])
 *
 * @example
 * ```typescript
 * // Client usage:
 * const planets = await orpc.planet.list.query({
 *   offset: 0,
 *   limit: 10
 * });
 * ```
 */
export const list = ar.system.list
  .use(
    permissionsMiddleware({
      requiredPermissions: ["read"],
      roles: ["admin", "issuer", "user", "auditor"],
    })
  )
  .use(theGraphMiddleware)
  .handler(async ({ input, context }) => {
    // Extract query parameters for pagination (offset-based pagination)
    const { offset, limit, orderDirection, orderBy } = input;

    const { systems } = await context.theGraphClient.request(listSystemQuery, {
      skip: offset,
      orderDirection,
      orderBy: orderBy as any,
      first: limit,
    });

    return systems;
  });
