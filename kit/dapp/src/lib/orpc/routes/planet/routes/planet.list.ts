import { permissionsMiddleware } from "@/lib/orpc/middlewares/auth/permissions.middleware";
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
export const list = ar.planet.list
  .use(
    permissionsMiddleware({
      requiredPermissions: ["read"],
      roles: ["admin", "issuer", "user", "auditor"],
    })
  )
  .handler(async ({ input, context }) => {
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
    const mockPlanets = [
      {
        id: "planet-mercury-001",
        name: "Mercury",
        description:
          "The smallest planet in our solar system and closest to the Sun",
      },
      {
        id: "planet-venus-002",
        name: "Venus",
        description:
          "The second planet from the Sun, known for its thick atmosphere and extreme temperatures",
      },
      {
        id: "planet-earth-003",
        name: "Earth",
        description: "Our home planet, the only known planet with life",
      },
      {
        id: "planet-mars-004",
        name: "Mars",
        description:
          "The Red Planet, fourth from the Sun with potential for human colonization",
      },
      {
        id: "planet-jupiter-005",
        name: "Jupiter",
        description:
          "The largest planet in our solar system, a gas giant with many moons",
      },
      {
        id: "planet-saturn-006",
        name: "Saturn",
        description:
          "Famous for its spectacular ring system, the sixth planet from the Sun",
      },
      {
        id: "planet-kepler452b-007",
        name: "Kepler-452b",
        description:
          "An exoplanet orbiting in the habitable zone of a Sun-like star",
      },
      {
        id: "planet-proxima-b-008",
        name: "Proxima Centauri b",
        description:
          "The closest known exoplanet to Earth, orbiting Proxima Centauri",
      },
      {
        id: "planet-trappist1e-009",
        name: "TRAPPIST-1e",
        description:
          "One of seven Earth-sized planets in the TRAPPIST-1 system",
      },
      {
        id: "planet-gliese667cc-010",
        name: "Gliese 667Cc",
        description:
          "A super-Earth exoplanet within the habitable zone of its host star",
      },
    ];

    // Apply pagination to the mock data
    const paginatedPlanets = mockPlanets.slice(offset, offset + limit);

    return paginatedPlanets;
  });
