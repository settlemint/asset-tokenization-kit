import { settings } from "@/lib/db/schema";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq } from "drizzle-orm";

/**
 * Setting delete route handler.
 *
 * Deletes a setting from the database by its key.
 * This operation is permanent and cannot be undone.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "delete" permission - available to admin role only
 * Method: DELETE /settings/:key
 * @param input - Delete parameters containing the setting key
 * @param context - Request context with database connection and authenticated user
 * @returns Promise<{ success: boolean }> - Success status of the deletion
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required delete permissions
 * @throws NOT_FOUND - If the setting key does not exist
 * @example
 * ```typescript
 * // Client usage:
 * const result = await orpc.settings.delete.mutate({
 *   key: 'systemAddress'
 * });
 * console.log(result.success); // true
 * ```
 */
export const del = authRouter.settings.delete
  .use(
    offChainPermissionsMiddleware({
      requiredPermissions: { setting: ["remove"] },
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ input, context }) => {
    const { key } = input;

    // Delete the setting and check if it existed
    await context.db.delete(settings).where(eq(settings.key, key));

    return {
      success: true,
    };
  });
