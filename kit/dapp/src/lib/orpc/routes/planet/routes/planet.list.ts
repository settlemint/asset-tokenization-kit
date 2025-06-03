import { ar } from "@/lib/orpc/routes/procedures/auth.router";

/**
 * Planet listing route handler.
 *
 * Handles the retrieval of multiple planets with optional filtering, pagination,
 * and sorting capabilities. This handler requires authentication and processes
 * query parameters to return a filtered list of planets. The implementation
 * currently returns mock data but should be replaced with actual database queries.
 *
 * Authentication: Required (uses authenticated router)
 * Method: GET /planets
 *
 * @param input - List parameters including pagination (validated against ListSchema)
 * @param context - Request context including authenticated user and database connection
 * @returns Promise<Planet[]> - Array of planet objects matching the query criteria
 *
 * @throws UNAUTHORIZED - If user is not authenticated
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
export const list = ar.planet.list.handler(async ({ input, context }) => {
  // Extract query parameters for pagination (offset-based pagination)
  const { offset, limit } = input;

  // Get database connection and user context
  const _db = context.db;
  const _user = context.auth.user;

  // TODO: Implement actual planet listing logic with database queries
  // Example implementation:
  // const planets = await db.planets.findMany({
  //   orderBy: { createdAt: 'desc' },
  //   skip: offset || 0,
  //   take: limit || 50,
  // });
  // return planets;

  // Temporary mock implementation - replace with actual database query
  return [
    { id: "xx", name: "name" },
    { id: "xxx", name: "name 2" },
    { id: "xxxx", name: "name 3" },
    { id: "xxxxx", name: "name 4" },
    { id: "xxxxxx", name: "name 5" },
    { id: "xxxxxxx", name: "name 6" },
    { id: "xxxxxxxx", name: "name 7" },
    { id: "xxxxxxxxx", name: "name 8" },
  ];
});
