import { kycProfiles, user } from "@/lib/db/schema";
import { getUserRole } from "@/lib/zod/validators/user-roles";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";
import { TRPCError } from "@trpc/server";
import { eq, ilike } from "drizzle-orm";

/**
 * User read route handler.
 *
 * Retrieves detailed information about a specific user by either their
 * internal ID or their wallet address. This endpoint is used for viewing
 * user profiles, admin user management, and user lookup functionality.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "list" permission on users resource
 * Method: GET /user/read
 *
 * @param input - Read parameters with either userId or wallet address
 * @param context - Request context with database connection and authenticated user
 * @returns Promise<User> - Single user object with complete information
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required list permissions
 * @throws NOT_FOUND - If user is not found
 * @throws INTERNAL_SERVER_ERROR - If database query fails
 *
 * @example
 * ```typescript
 * // Read user by ID
 * const user = await orpc.user.read.query({
 *   userId: "user-123"
 * });
 *
 * // Read user by wallet address
 * const user = await orpc.user.read.query({
 *   wallet: "0x1234567890123456789012345678901234567890"
 * });
 * ```
 *
 * @remarks
 * - Exactly one of userId or wallet must be provided
 * - Wallet address matching is case-insensitive
 * - Returns complete user information including KYC data
 * - User roles are transformed from internal codes to display names
 */
export const read = authRouter.user.read
  .use(
    offChainPermissionsMiddleware({ requiredPermissions: { user: ["list"] } })
  )
  .use(databaseMiddleware)
  .handler(async ({ context, input }) => {
    const { userId, wallet } = input;

    // Build the query condition based on input
    const whereCondition = userId
      ? eq(user.id, userId)
      : ilike(user.wallet, wallet); // wallet is guaranteed to exist by schema validation

    // Execute query to find the user with KYC data
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
      .where(whereCondition)
      .limit(1);

    // Check if user was found
    if (result.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: userId
          ? `User with ID ${userId} not found`
          : `User with wallet ${wallet} not found`,
      });
    }

    const { user: userData, kyc } = result[0];

    // Validate user has wallet
    if (!userData.wallet) {
      throw new Error(`User ${userData.id} has no wallet`);
    }

    // Transform result to include human-readable role
    return {
      id: userData.id,
      name:
        kyc?.firstName && kyc.lastName
          ? `${kyc.firstName} ${kyc.lastName}`
          : userData.name,
      email: userData.email,
      role: getUserRole(userData.role),
      wallet: userData.wallet,
      firstName: kyc?.firstName,
      lastName: kyc?.lastName,
    } as User;
  });
