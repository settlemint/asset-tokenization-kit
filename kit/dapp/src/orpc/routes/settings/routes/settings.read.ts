import { settings } from "@/lib/db/schema";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq } from "drizzle-orm";

/**
 * Setting read route handler.
 *
 * Retrieves a single setting value by its key from the database.
 * This route is used to fetch application configuration values
 * such as the base currency or system address.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "read" permission - available to admin, issuer, user, and auditor roles
 * Method: GET /settings/:key
 * @param input - Read parameters containing the setting key
 * @param context - Request context with database connection and authenticated user
 * @returns Promise<string | null> - The setting value, or null if not found
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions
 * @example
 * ```typescript
 * // Client usage:
 * const systemAddress = await orpc.settings.read.query({
 *   key: 'SYSTEM_ADDRESS'
 * });
 * console.log(systemAddress); // "0x1234..."
 * ```
 */
export const read = authRouter.settings.read
  .use(
    offChainPermissionsMiddleware({
      requiredPermissions: { setting: ["read"] },
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ input, context }) => {
    const { key } = input;

    // Query the setting from the database
    const [setting] = await context.db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);

    // Check if the setting exists
    if (!setting) {
      return null;
    }

    return setting.value;
  });
