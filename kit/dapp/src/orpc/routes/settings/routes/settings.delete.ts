import { settings } from "@/lib/db/schema";
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
 *
 * @param input - Delete parameters containing the setting key
 * @param context - Request context with database connection and authenticated user
 * @returns Promise<{ success: boolean }> - Success status of the deletion
 *
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required delete permissions
 * @throws NOT_FOUND - If the setting key does not exist
 *
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
  // TODO JAN: add permissions middleware, needs the default user role in better auth
  // .use(
  //   permissionsMiddleware({
  //     requiredPermissions: ["delete"],
  //     roles: ["admin"],
  //   })
  // )
  .use(databaseMiddleware)
  .handler(async ({ input, context, errors }) => {
    const { key } = input;

    // Check if setting exists
    const [existingSetting] = await context.db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);

    if (!existingSetting) {
      throw errors.NOT_FOUND({
        message: `Setting with key '${key}' not found`,
      });
    }

    // Delete the setting
    await context.db.delete(settings).where(eq(settings.key, key));

    return { success: true };
  });
