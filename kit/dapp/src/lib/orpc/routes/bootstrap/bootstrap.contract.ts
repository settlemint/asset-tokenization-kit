import { BootstrapSchema } from "@/lib/orpc/routes/bootstrap/schemas/bootstrap.schema";
import { FindSchema } from "@/lib/orpc/routes/common/find.schema";
import { ListSchema } from "@/lib/orpc/routes/common/list.schema";
import { ac } from "@/lib/orpc/routes/procedures/auth.contract";
import { z } from "zod";

/**
 * Bootstrap creation endpoint contract.
 *
 * Defines the API contract for creating new bootstrap configurations. This endpoint requires
 * authentication and accepts bootstrap data without an ID and timestamps (since they are
 * generated server-side). Returns the complete bootstrap object including
 * the generated ID and timestamps.
 *
 * Security: Requires valid authentication
 * Method: POST /bootstrap
 */
const create = ac
  .route({
    method: "POST",
    path: "/bootstrap",
    description: "Create a bootstrap configuration",
    successDescription: "Bootstrap configuration created",
    tags: ["bootstrap"],
  })
  .input(BootstrapSchema.omit({ id: true, createdAt: true, updatedAt: true })) // Omit server-generated fields
  .output(BootstrapSchema); // Return complete bootstrap with generated fields

/**
 * Bootstrap retrieval endpoint contract.
 *
 * Defines the API contract for finding a specific bootstrap configuration by its ID.
 * This endpoint requires authentication and uses the common FindSchema
 * for consistent ID-based lookups across the application.
 *
 * Security: Requires valid authentication
 * Method: GET /bootstrap/{id}
 */
const find = ac
  .route({
    method: "GET",
    path: "/bootstrap/{id}",
    description: "Find a bootstrap configuration",
    successDescription: "Bootstrap configuration found",
    tags: ["bootstrap"],
  })
  .input(FindSchema) // Standard ID-based lookup schema
  .output(BootstrapSchema); // Return single bootstrap object

/**
 * Bootstrap listing endpoint contract.
 *
 * Defines the API contract for retrieving a list of bootstrap configurations with optional
 * filtering, pagination, and sorting. Uses the common ListSchema for
 * consistent query parameters across list endpoints.
 *
 * Security: Requires valid authentication
 * Method: GET /bootstrap
 */
const list = ac
  .route({
    method: "GET",
    path: "/bootstrap",
    description: "List bootstrap configurations",
    successDescription: "List of bootstrap configurations",
    tags: ["bootstrap"],
  })
  .input(ListSchema) // Standard list query parameters (pagination, filters, etc.)
  .output(z.array(BootstrapSchema)); // Return array of bootstrap objects

/**
 * Bootstrap update endpoint contract.
 *
 * Defines the API contract for updating an existing bootstrap configuration.
 * This endpoint requires authentication and accepts partial bootstrap data
 * along with the ID for identification.
 *
 * Security: Requires valid authentication
 * Method: PUT /bootstrap/{id}
 */
const update = ac
  .route({
    method: "PUT",
    path: "/bootstrap/{id}",
    description: "Update a bootstrap configuration",
    successDescription: "Bootstrap configuration updated",
    tags: ["bootstrap"],
  })
  .input(
    z.object({
      id: z.string().min(1, "ID is required"),
      data: BootstrapSchema.omit({ id: true, createdAt: true, updatedAt: true }).partial(),
    })
  )
  .output(BootstrapSchema);

/**
 * Bootstrap deletion endpoint contract.
 *
 * Defines the API contract for deleting a bootstrap configuration by its ID.
 * This endpoint requires authentication and uses the common FindSchema
 * for consistent ID-based operations.
 *
 * Security: Requires valid authentication
 * Method: DELETE /bootstrap/{id}
 */
const remove = ac
  .route({
    method: "DELETE",
    path: "/bootstrap/{id}",
    description: "Delete a bootstrap configuration",
    successDescription: "Bootstrap configuration deleted",
    tags: ["bootstrap"],
  })
  .input(FindSchema) // Standard ID-based lookup schema
  .output(z.object({ success: z.boolean() })); // Return success status

/**
 * Complete bootstrap API contract.
 *
 * Exports all bootstrap-related API endpoints as a cohesive contract.
 * This contract defines the complete bootstrap API surface, including
 * CRUD operations and any additional bootstrap-specific endpoints.
 *
 * Available operations:
 * - list: Retrieve multiple bootstrap configurations with filtering/pagination
 * - find: Retrieve a specific bootstrap configuration by ID
 * - create: Create a new bootstrap configuration
 * - update: Update an existing bootstrap configuration
 * - remove: Delete a bootstrap configuration
 *
 * All endpoints require authentication and follow RESTful conventions.
 *
 * @see {@link ./schemas/bootstrap.schema} - Bootstrap data schema
 * @see {@link ../procedures/auth.contract} - Authentication contract base
 */
export const bootstrapContract = {
  list,
  find,
  create,
  update,
  remove,
};