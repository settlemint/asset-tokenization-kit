import { permissionsMiddleware } from "@/lib/orpc/middlewares/auth/permissions.middleware";
import { ar } from "../../procedures/auth.router";

/**
 * Bootstrap creation route handler.
 *
 * Handles the creation of new bootstrap configurations in the system. This handler requires
 * authentication and processes the incoming bootstrap data to create a new
 * bootstrap entity. The implementation currently returns mock data but should
 * be replaced with actual database operations.
 *
 * Authentication: Required (uses authenticated router)
 * API Key Permissions: Requires "create" permissions for "bootstrap" resource
 * Method: POST /bootstrap
 *
 * @param input - Bootstrap data without ID and timestamps (validated against BootstrapSchema.omit())
 * @param context - Request context including authenticated user and database connection
 * @returns Promise<Bootstrap> - The created bootstrap configuration with generated ID and timestamps
 *
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If API key lacks required permissions (bootstrap: [create])
 *
 * @example
 * ```typescript
 * // Client usage:
 * const newBootstrap = await orpc.bootstrap.create.mutate({
 *   name: "Development Bootstrap",
 *   config: { environment: "dev", features: ["auth", "db"] },
 *   description: "Bootstrap configuration for development environment"
 * });
 * ```
 */
export const create = ar.bootstrap.create
  .use(
    permissionsMiddleware({ requiredPermissions: ["create"], roles: ["admin"] })
  )
  .handler(async ({ input, context }) => {
    // Extract authenticated user information from context
    const user = context.auth.user;

    // Get database connection from context
    const _db = context.db;

    // TODO: Implement actual bootstrap creation logic
    // Example implementation:
    // const bootstrap = await db.bootstrap.create({
    //   data: {
    //     ...input,
    //     createdBy: user.id,
    //     createdAt: new Date().toISOString(),
    //     updatedAt: new Date().toISOString(),
    //   }
    // });
    // return bootstrap;

    // Temporary mock implementation - replace with actual database operations
    const now = new Date().toISOString();
    return {
      id: `bootstrap-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: input.name,
      config: input.config,
      status: input.status || "pending",
      description: input.description || undefined,
      createdAt: now,
      updatedAt: now,
    };
  });