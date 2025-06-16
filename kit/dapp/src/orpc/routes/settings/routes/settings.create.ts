import { settings } from "@/lib/db/schema";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq } from "drizzle-orm";

/**
 * Setting create route handler.
 *
 * Creates a new setting in the database. If a setting with the same key
 * already exists, it will return a conflict error.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "create" permission - available to admin role only
 * Method: POST /settings
 *
 * @param input - Create parameters containing the setting key and value
 * @param context - Request context with database connection and authenticated user
 * @returns Promise<Setting> - The newly created setting object
 *
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required create permissions
 * @throws CONFLICT - If a setting with the same key already exists
 *
 * @example
 * ```typescript
 * // Client usage:
 * const newSetting = await orpc.settings.create.mutate({
 *   key: 'systemAddress',
 *   value: '0x1234567890abcdef'
 * });
 * ```
 */
export const create = authRouter.settings.create
  .use(databaseMiddleware)
  .handler(async ({ input, context, errors }) => {
    const { key, value } = input;

    // Check if setting already exists
    const [existingSetting] = await context.db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);

    if (existingSetting) {
      throw errors.RESOURCE_ALREADY_EXISTS({
        message: `Setting with key '${key}' already exists`,
      });
    }

    // Insert the new setting
    const [newSetting] = await context.db
      .insert(settings)
      .values({
        key,
        value,
        lastUpdated: new Date(),
      })
      .returning();

    if (!newSetting) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: `Failed to create setting with key '${key}'`,
      });
    }

    return newSetting;
  });
