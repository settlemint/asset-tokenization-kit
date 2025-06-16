import { settings } from "@/lib/db/schema";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq } from "drizzle-orm";

/**
 * Setting update route handler.
 *
 * Updates an existing setting's value in the database.
 * The lastUpdated timestamp is automatically updated to the current time.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "update" permission - available to admin role only
 * Method: PUT /settings/:key
 *
 * @param input - Update parameters containing the setting key and new value
 * @param context - Request context with database connection and authenticated user
 * @returns Promise<Setting> - The updated setting object
 *
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required update permissions
 * @throws NOT_FOUND - If the setting key does not exist
 *
 * @example
 * ```typescript
 * // Client usage:
 * const updatedSetting = await orpc.settings.update.mutate({
 *   key: 'baseCurrency',
 *   value: 'USD'
 * });
 * ```
 */
export const update = authRouter.settings.update
  .use(databaseMiddleware)
  .handler(async ({ input, context, errors }) => {
    const { key, value } = input;

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

    // Update the setting
    const [updatedSetting] = await context.db
      .update(settings)
      .set({
        value,
        lastUpdated: new Date(),
      })
      .where(eq(settings.key, key))
      .returning();

    if (!updatedSetting) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: `Failed to update setting with key '${key}'`,
      });
    }

    return updatedSetting;
  });
