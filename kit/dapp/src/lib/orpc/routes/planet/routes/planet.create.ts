import { permissionsMiddleware } from "@/lib/orpc/middlewares/auth/permissions.middleware";
import { ar } from "@/lib/orpc/procedures/auth.router";

/**
 * Planet creation route handler.
 *
 * Handles the creation of new planets in the system. This handler requires
 * authentication and processes the incoming planet data to create a new
 * planet entity. The implementation currently returns mock data but should
 * be replaced with actual database operations.
 *
 * Authentication: Required (uses authenticated router)
 * API Key Permissions: Requires "write" permissions for "planet" resource
 * Method: POST /planets
 *
 * @param input - Planet data without ID (validated against PlanetSchema.omit({ id: true }))
 * @param context - Request context including authenticated user and database connection
 * @returns Promise<Planet> - The created planet with generated ID
 *
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If API key lacks required permissions (planet: [write])
 *
 * @example
 * ```typescript
 * // Client usage:
 * const newPlanet = await orpc.planet.create.mutate({
 *   name: "Kepler-452b",
 *   description: "Earth-like exoplanet"
 * });
 * ```
 */
export const create = ar.planet.create
  .use(
    permissionsMiddleware({ requiredPermissions: ["create"], roles: ["admin"] })
  )
  .handler(async ({ input, context }) => {
    // Extract authenticated user information from context
    const user = context.auth.user;

    // Get database connection from context
    const _db = context.db;

    // TODO: Implement actual planet creation logic
    // Example implementation:
    // const planet = await db.planets.create({
    //   data: {
    //     ...input,
    //     createdBy: user.id,
    //     createdAt: new Date(),
    //   }
    // });
    // return planet;

    // Temporary mock implementation - replace with actual database operations
    return {
      id: `planet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: input.name,
      description: input.description || undefined,
    };
  });
