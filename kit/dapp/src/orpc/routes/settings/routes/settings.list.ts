import { settings } from "@/lib/db/schema";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { asc, desc } from "drizzle-orm";

/**
 * Settings listing route handler.
 *
 * Retrieves a paginated list of all settings from the database.
 * This route is used to fetch all application configuration values
 * with support for pagination and sorting.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "read" permission - available to admin, issuer, user, and auditor roles
 * Method: GET /settings
 * @param input - List parameters including pagination and sorting options
 * @param context - Request context with database connection and authenticated user
 * @returns Promise<Setting[]> - Array of setting objects
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions
 * @example
 * ```typescript
 * // Client usage:
 * const settingsList = await orpc.settings.list.query({
 *   offset: 0,
 *   limit: 20,
 *   orderBy: 'key',
 *   orderDirection: 'asc'
 * });
 * ```
 */
export const list = authRouter.settings.list
  .use(
    offChainPermissionsMiddleware({
      requiredPermissions: { setting: ["read"] },
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ input, context }) => {
    // Extract pagination parameters
    const { offset, limit, orderDirection, orderBy } = input;

    // Determine sort order
    const order = orderDirection === "desc" ? desc : asc;

    // Map orderBy field to the correct column
    // Support both 'key' and 'lastUpdated' as valid sort fields
    const orderColumn =
      orderBy === "lastUpdated" ? settings.lastUpdated : settings.key;

    // Query settings with pagination and sorting
    const result = await context.db
      .select()
      .from(settings)
      .orderBy(order(orderColumn))
      .limit(limit ?? 1000)
      .offset(offset);

    return result;
  });
