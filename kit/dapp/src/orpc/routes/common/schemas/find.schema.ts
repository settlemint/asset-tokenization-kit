import { z } from "zod/v4";

/**
 * Common find schema for ID-based entity lookups.
 *
 * This schema provides a standardized way to validate ID parameters across
 * all API endpoints that need to find a specific entity by its identifier.
 * It ensures consistent validation and type safety for single-entity retrieval
 * operations throughout the application.
 *
 * The schema is designed to be reusable across different entity types
 * (planets, users, assets, etc.) while maintaining consistent validation
 * rules and error handling.
 *
 * Used by endpoints like:
 * - GET /planets/{id}
 * - GET /users/{id}
 * - GET /assets/{id}
 * - Any other single-entity lookup endpoint
 * @example
 * ```typescript
 * // Usage in route contracts:
 * const findPlanet = contract.route({
 *   method: "GET",
 *   path: "/planets/{id}"
 * }).input(FindSchema);
 *
 * // Client usage:
 * const planet = await api.planets.find.query({ id: "planet-123" });
 * ```
 */
export const FindSchema = z.object({
  /**
   * Entity identifier.
   *
   * A string-based unique identifier for the entity to be retrieved.
   * This could be a UUID, nanoid, or any other string-based ID format
   * depending on the application's ID generation strategy.
   *
   * The ID is typically extracted from the URL path parameter and
   * validated to ensure it's a non-empty string before being used
   * in database queries or other lookup operations.
   */
  id: z.string(),
});
