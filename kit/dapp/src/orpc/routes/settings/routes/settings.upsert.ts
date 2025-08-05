import { settings } from "@/lib/db/schema";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";

/**
 * Setting update/create route handler.
 *
 * Updates an existing setting's value in the database, or creates a new setting
 * if it doesn't exist. The lastUpdated timestamp is automatically set to the
 * current time.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "update" permission - available to admin role only
 * Method: PUT /settings/:key
 * @param input - Update parameters containing the setting key and new value
 * @param context - Request context with database connection and authenticated user
 * @returns Promise<string> - The updated or newly created setting value
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required update permissions
 * @throws INTERNAL_SERVER_ERROR - If the database operation fails
 * @example
 * ```typescript
 * // Client usage:
 * const value = await orpc.settings.upsert.mutate({
 *   key: 'SYSTEM_ADDRESS',
 *   value: '0x1234...'
 * });
 * console.log(value); // "0x1234..."
 * ```
 */
export const upsert = authRouter.settings.upsert
  .use(
    offChainPermissionsMiddleware({
      requiredPermissions: { setting: ["upsert"] },
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ input, context, errors }) => {
    const { key, value } = input;

    // Upsert the setting - update if exists, insert if not
    const [upsertedSetting] = await context.db
      .insert(settings)
      .values({
        key,
        value,
        lastUpdated: new Date(),
      })
      .onConflictDoUpdate({
        target: settings.key,
        set: {
          value,
          lastUpdated: new Date(),
        },
      })
      .returning();

    if (!upsertedSetting) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: `Failed to upsert setting with key '${key}'`,
      });
    }

    // Return just the value as expected by the contract
    // The success message is available via context.t("settings:actions.upsert.success", { key })
    // if needed for audit logging in the future
    return upsertedSetting.value;
  });
