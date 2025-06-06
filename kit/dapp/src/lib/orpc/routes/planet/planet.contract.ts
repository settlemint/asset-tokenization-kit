import { FindSchema } from "@/lib/orpc/routes/common/find.schema";
import { ListSchema } from "@/lib/orpc/routes/common/list.schema";
import { PlanetSchema } from "@/lib/orpc/routes/planet/schemas/planet.schema";
import { ac } from "@/lib/orpc/routes/procedures/auth.contract";
import { z } from "zod/v4";

/**
 * Planet creation endpoint contract.
 *
 * Defines the API contract for creating new planets. This endpoint requires
 * authentication and accepts planet data without an ID (since IDs are
 * generated server-side). Returns the complete planet object including
 * the generated ID.
 *
 * Security: Requires valid authentication
 * Method: POST /planets
 */
const create = ac
  .route({
    method: "POST",
    path: "/planets",
    description: "Create a planet",
    successDescription: "Planet created",
    tags: ["planet"],
  })
  .input(PlanetSchema.omit({ id: true })) // Omit ID since it's generated server-side
  .output(PlanetSchema); // Return complete planet with generated ID

/**
 * Planet retrieval endpoint contract.
 *
 * Defines the API contract for finding a specific planet by its ID.
 * This endpoint requires authentication and uses the common FindSchema
 * for consistent ID-based lookups across the application.
 *
 * Security: Requires valid authentication
 * Method: GET /planets/{id}
 */
const find = ac
  .route({
    method: "GET",
    path: "/planets/{id}",
    description: "Find a planet",
    successDescription: "Planet found",
    tags: ["planet"],
  })
  .input(FindSchema) // Standard ID-based lookup schema
  .output(PlanetSchema); // Return single planet object

/**
 * Planet listing endpoint contract.
 *
 * Defines the API contract for retrieving a list of planets with optional
 * filtering, pagination, and sorting. Uses the common ListSchema for
 * consistent query parameters across list endpoints.
 *
 * Security: Requires valid authentication
 * Method: GET /planets
 */
const list = ac
  .route({
    method: "GET",
    path: "/planets",
    description: "List planets",
    successDescription: "List of planets",
    tags: ["planet"],
  })
  .input(ListSchema) // Standard list query parameters (pagination, filters, etc.)
  .output(z.array(PlanetSchema)); // Return array of planet objects

/**
 * Complete planet API contract.
 *
 * Exports all planet-related API endpoints as a cohesive contract.
 * This contract defines the complete planet API surface, including
 * CRUD operations and any additional planet-specific endpoints.
 *
 * Available operations:
 * - list: Retrieve multiple planets with filtering/pagination
 * - find: Retrieve a specific planet by ID
 * - create: Create a new planet
 *
 * All endpoints require authentication and follow RESTful conventions.
 *
 * @see {@link ./schemas/planet.schema} - Planet data schema
 * @see {@link ../procedures/auth.contract} - Authentication contract base
 */
export const planetContract = {
  list,
  find,
  create,
};
