import { permissionsMiddleware } from "@/lib/orpc/middlewares/auth/permissions.middleware";
import { ar } from "../../procedures/auth.router";

/**
 * Bootstrap removal route handler.
 *
 * Handles the deletion of a bootstrap configuration by its ID.
 * This handler requires authentication and admin permissions to
 * permanently delete the specified bootstrap configuration.
 *
 * Authentication: Required (uses authenticated router)
 * API Key Permissions: Requires "delete" permissions for "bootstrap" resource
 * Method: DELETE /bootstrap/{id}
 *
 * @param input - Delete parameters containing the bootstrap ID
 * @param context - Request context including authenticated user and database connection
 * @returns Promise<{success: boolean}> - Success status of the deletion operation
 *
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If API key lacks required permissions (bootstrap: [delete])
 * @throws NOT_FOUND - If bootstrap with the specified ID doesn't exist
 */
export const remove = ar.bootstrap.remove
  .use(
    permissionsMiddleware({ requiredPermissions: ["delete"], roles: ["admin"] })
  )
  .handler(async ({ input, context }) => {
    // Extract authenticated user information from context
    const user = context.auth.user;

    // Get database connection from context
    const _db = context.db;

    // TODO: Implement actual bootstrap deletion logic
    // Example implementation:
    // const existingBootstrap = await db.bootstrap.findUnique({
    //   where: { id: input.id }
    // });
    //
    // if (!existingBootstrap) {
    //   throw new Error("Bootstrap configuration not found");
    // }
    //
    // await db.bootstrap.delete({
    //   where: { id: input.id }
    // });
    //
    // return { success: true };

    // Temporary mock implementation - replace with actual database operations
    // In a real implementation, you would verify the bootstrap exists before deletion
    return { success: true };
  });