import { permissionsMiddleware } from "@/lib/orpc/middlewares/auth/permissions.middleware";
import { ar } from "@/lib/orpc/routes/procedures/auth.router";

/**
 * Planet retrieval route handler.
 *
 * Handles the retrieval of a specific planet by its ID. This handler requires
 * authentication and looks up a planet using the provided ID parameter.
 * The implementation currently returns mock data but should be replaced
 * with actual database queries.
 *
 * Authentication: Required (uses authenticated router)
 * API Key Permissions: Requires "read" permission for "planet" resource
 * Method: GET /planets/{id}
 *
 * @param input - Find parameters including the planet ID (validated against FindSchema)
 * @param context - Request context including authenticated user and database connection
 * @returns Promise<Planet> - The found planet object
 *
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If API key lacks required permissions (planet: [read])
 * @throws NOT_FOUND - If planet with given ID doesn't exist (should be implemented)
 *
 * @example
 * ```typescript
 * // Client usage:
 * const planet = await orpc.planet.find.query({ id: "planet-123" });
 * ```
 */
export const find = ar.planet.find
  .use(
    permissionsMiddleware({
      requiredPermissions: ["read"],
      roles: ["admin", "issuer", "user", "auditor"],
    })
  )
  .handler(async ({ input }) => {
    // Extract the planet ID from input parameters
    const { id } = input;

    // TODO: Implement actual planet lookup logic
    // Example implementation:
    // const planet = await db.planets.findUnique({
    //   where: { id }
    // });
    //
    // if (!planet) {
    //   throw new Error("Planet not found");
    // }
    //
    // return planet;

    // Temporary mock implementation - replace with actual database query
    return { id: "xxx", name: "name" };
  });
