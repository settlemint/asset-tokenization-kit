import { getUserRole } from "@atk/zod/validators/user-roles";
import { desc, eq, ilike, or } from "drizzle-orm";
import { kycProfiles, user } from "@/lib/db/schema";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";

/**
 * User search route handler.
 *
 * Provides flexible search functionality for users by firstName, lastName, name, or wallet address.
 * This endpoint is optimized for autocomplete, search suggestions, and quick lookups
 * where users need to find specific users without browsing full lists.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "list" permission on users resource
 * Method: GET /user/search
 *
 * @param input - Search parameters including query string and result limit
 * @param context - Request context with database connection and authenticated user
 * @returns Promise<User[]> - Array of users matching the search criteria
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required list permissions
 * @throws INTERNAL_SERVER_ERROR - If database query fails
 *
 * @example
 * ```typescript
 * // Search for users by name
 * const users = await orpc.user.search.query({
 *   query: "John",
 *   limit: 10
 * });
 *
 * // Search by wallet address
 * const usersByWallet = await orpc.user.search.query({
 *   query: "0x123...abc",
 *   limit: 5
 * });
 *
 * // Search with partial name match
 * const nameMatches = await orpc.user.search.query({
 *   query: "Doe"
 * });
 * ```
 *
 * @remarks
 * - The query parameter is matched against firstName, lastName, name, and wallet address
 * - Uses case-insensitive partial matching (ILIKE) for all fields
 * - Results are limited for performance optimization
 * - User roles are transformed from internal codes to display names
 */
export const search = authRouter.user.search
  .use(
    offChainPermissionsMiddleware({ requiredPermissions: { user: ["list"] } })
  )
  .use(databaseMiddleware)
  .handler(async ({ context, input }) => {
    const { query, limit } = input;

    // Execute search query with KYC data
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
      .where(
        or(
          ilike(kycProfiles.firstName, `%${query}%`),
          ilike(kycProfiles.lastName, `%${query}%`),
          ilike(user.name, `%${query}%`), // Useful when user hasn't completed KYC
          ilike(user.wallet, `%${query}%`)
        )
      )
      .orderBy(desc(user.updatedAt)) // Most recently updated users first
      .limit(limit);

    // Transform results to include human-readable roles
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
