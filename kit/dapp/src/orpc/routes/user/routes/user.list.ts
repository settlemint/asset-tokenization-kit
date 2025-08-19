import { getUserRole } from "@atk/zod/validators/user-roles";
import { type AnyColumn, asc, desc, eq } from "drizzle-orm";
import { kycProfiles, user } from "@/lib/db/schema";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";

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
 * @param context - Request context with database connection and authenticated user
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
  .use(
    offChainPermissionsMiddleware({ requiredPermissions: { user: ["list"] } })
  )
  .use(databaseMiddleware)
  .handler(async ({ context, input }) => {
    const { limit, offset, orderDirection, orderBy } = input;

    // Configure sort direction based on input
    const order = orderDirection === "desc" ? desc : asc;

    // Safely access the order column, defaulting to createdAt if invalid
    const orderColumn =
      (user[orderBy as keyof typeof user] as AnyColumn | undefined) ??
      user.createdAt;

    // Execute paginated query with sorting and KYC data
    const result = await context.db
      .select({
        user: user,
        kyc: {
          firstName: kycProfiles.firstName,
          lastName: kycProfiles.lastName,
        },
      })
      .from(user)
      .leftJoin(kycProfiles, eq(kycProfiles.userId, user.id))
      .orderBy(order(orderColumn))
      .limit(limit ?? 1000)
      .offset(offset);

    // Transform results to include human-readable roles and onboarding state
    return result.map(({ user, kyc }) => {
      if (!user.wallet) {
        throw new Error(`User ${user.id} has no wallet`);
      }
      return {
        id: user.id,
        name:
          kyc?.firstName && kyc.lastName
            ? `${kyc.firstName} ${kyc.lastName}`
            : user.name,
        email: user.email,
        role: getUserRole(user.role),
        wallet: user.wallet,
        firstName: kyc?.firstName,
        lastName: kyc?.lastName,
      } as User;
    });
  });
