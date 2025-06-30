import { user } from "@/lib/db/schema";
import { getUserRole } from "@/lib/zod/validators/user-roles";
import { permissionsMiddleware } from "@/orpc/middlewares/auth/permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";

/**
 * User listing route handler.
 *
 * Retrieves a paginated list of users from the database with support for
 * flexible sorting and pagination. This endpoint is used for user management
 * interfaces, admin dashboards, and user directories.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "list" permission on users resource
 * Method: GET /users
 *
 * @param input - List parameters including pagination and sorting
 * @param context - Request context with enhanced database client and authenticated user
 * @returns Promise<User[]> - Array of user objects with roles mapped to display names
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required list permissions
 * @throws INTERNAL_SERVER_ERROR - If database query fails
 *
 * @example
 * ```typescript
 * // Get all users with default pagination
 * const users = await orpc.user.list.query({});
 *
 * // Get users sorted by email, descending
 * const usersByEmail = await orpc.user.list.query({
 *   orderBy: 'email',
 *   orderDirection: 'desc'
 * });
 *
 * // Get second page of users (20 per page)
 * const page2 = await orpc.user.list.query({
 *   offset: 20,
 *   limit: 20
 * });
 * ```
 *
 * @remarks
 * - The orderBy parameter accepts any valid user table column
 * - If an invalid orderBy column is specified, defaults to createdAt
 * - User roles are transformed from internal codes to display names
 */
export const list = authRouter.user.list
  .use(permissionsMiddleware({ user: ["list"] }))
  .use(databaseMiddleware)
  .handler(async ({ context, input }) => {
    // Use the enhanced database client's list method
    const result = await context.db.list(user, input, {
      defaultOrderBy: "createdAt",
    });

    // Transform results to include human-readable roles
    return result.map((user) => ({
      ...user,
      role: getUserRole(user.role),
    }));
  });
