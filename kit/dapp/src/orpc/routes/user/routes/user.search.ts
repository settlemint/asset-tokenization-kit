import { kycProfiles, user } from "@/lib/db/schema";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";

import { getUserRole } from "@atk/zod/user-roles";
import { desc, eq, ilike, or } from "drizzle-orm";

// Type for database query result
type QueryResultRow = {
  user: typeof user.$inferSelect;
  kyc: {
    firstName: string | null;
    lastName: string | null;
  } | null;
};

/**
 * User search route handler.
 *
 * Provides flexible search functionality for users by firstName, lastName, name, or wallet address.
 * This endpoint is optimized for autocomplete, search suggestions, and quick lookups
 * where users need to find specific users without browsing full lists.
 *
 * **Key Differences from user.list:**
 * - ✅ Requires search query (minimum 2 characters)
 * - ✅ Optimized for UI components (dropdowns, autocomplete)
 * - ✅ Fast response with limited results (max 50)
 * - ❌ **No blockchain identity data** (identity, claims, isRegistered)
 * - ❌ No pagination support
 * - ❌ Limited sorting options
 *
 * **Use Cases:**
 * - User selection dropdowns
 * - Search/autocomplete forms
 * - Quick user lookup by name or wallet
 *
 * **When to use user.list instead:**
 * - Need complete user data with identity information
 * - Administrative user browsing with pagination
 * - Full user management interfaces
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "list" permission on users resource
 * Method: GET /user/search
 *
 * @param input - Search parameters including query string and result limit
 * @param context - Request context with database connection and authenticated user
 * @returns Promise<UserSearchOutput> - Array of users with name, wallet, and role only
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required list permissions
 * @throws INTERNAL_SERVER_ERROR - If database query fails
 *
 * @example
 * ```typescript
 * // ✅ Good: Search for users by name for a dropdown
 * const users = await orpc.user.search.query({
 *   query: "John",
 *   limit: 10
 * });
 * // Returns: { name, wallet, role }
 *
 * // ✅ Good: Search by wallet address for user selection
 * const usersByWallet = await orpc.user.search.query({
 *   query: "0x123...abc",
 *   limit: 5
 * });
 *
 * // ❌ Bad: Don't use for identity verification workflows
 * // Use user.read or user.list instead for identity data
 * ```
 *
 * @remarks
 * - **Search Fields**: firstName, lastName, name, wallet address (case-insensitive)
 * - **Performance**: Results limited to max 50 for optimal UI performance
 * - **Minimal Data**: Only returns name, wallet, and role for security and performance
 * - **UI Optimized**: Perfect for Select, Autocomplete, and search components
 */
export const search = authRouter.user.search
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.userSearch,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
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

    // Transform results to only include name, wallet, and role
    // This minimal approach is optimized for UI components and prevents
    // accidental exposure of sensitive data
    return result.map((row: QueryResultRow) => {
      const { user, kyc } = row;
      return {
        name:
          kyc?.firstName && kyc.lastName
            ? `${kyc.firstName} ${kyc.lastName}`
            : user.name,
        wallet: user.wallet,
        role: getUserRole(user.role),
      };
    });
  });
