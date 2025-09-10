import { kycProfiles, user } from "@/lib/db/schema";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import {
  filterClaimsForUser,
  identityPermissionsMiddleware,
} from "@/orpc/middlewares/auth/identity-permissions.middleware";
import { trustedIssuerMiddleware } from "@/orpc/middlewares/auth/trusted-issuer.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { me as readAccount } from "@/orpc/routes/account/routes/account.me";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";
import { getUserRole } from "@atk/zod/user-roles";
import { call, ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { UserReadInputSchema } from "./user.read.schema";

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
 * @param input - Read parameters with either {userId: string} or {wallet: Address}
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
 * - Input uses discriminated union: either {userId} or {wallet} object
 * - TypeScript properly narrows the input type for better type safety
 * - Wallet address matching uses exact comparison after normalization
 * - Returns complete user information including KYC data
 * - User roles are transformed from internal codes to display names
 */
export const read = authRouter.user.read
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: { any: ["identityManager", "claimIssuer"] },
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
  )
  .use(trustedIssuerMiddleware)
  .use(
    identityPermissionsMiddleware<typeof UserReadInputSchema>({
      getTargetUserId: ({ input }) =>
        "userId" in input ? input.userId : undefined,
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ context, input, errors }) => {
    // Build the query condition based on input type
    // TypeScript now properly narrows the union type
    const whereCondition =
      "userId" in input
        ? eq(user.id, input.userId)
        : eq(user.wallet, input.wallet);

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

    if (result.length === 0) {
      throw errors.NOT_FOUND({
        message:
          "userId" in input
            ? `User with ID ${input.userId} not found`
            : `User with wallet ${input.wallet} not found`,
      });
    }

    const userResult = result[0];
    if (!userResult) {
      throw errors.NOT_FOUND({
        message:
          "userId" in input
            ? `User with ID ${input.userId} not found`
            : `User with wallet ${input.wallet} not found`,
      });
    }

    const { user: userData, kyc } = userResult;

    // Handle users without wallets gracefully
    if (!userData.wallet) {
      return {
        id: userData.id,
        name:
          kyc?.firstName && kyc.lastName
            ? `${kyc.firstName} ${kyc.lastName}`
            : userData.name,
        email: userData.email,
        role: getUserRole(userData.role),
        wallet: userData.wallet, // null
        firstName: kyc?.firstName,
        lastName: kyc?.lastName,
        identity: undefined,
        claims: [],
        isRegistered: false,
        createdAt: userData.createdAt?.toISOString(),
        lastLoginAt: userData.lastLoginAt?.toISOString(),
      } as User;
    }

    // Fetch identity data from TheGraph for this specific user
    const accountData = await call(
      readAccount,
      { wallet: userData.wallet },
      { context }
    ).catch((error: unknown) => {
      if (error instanceof ORPCError && error.status === 404) {
        return null;
      }
      throw error;
    });

    const identity = accountData?.identity;

    // Get all claims for this user
    const allClaims = accountData?.claims ?? [];

    // Filter claims based on user's permissions
    const filteredClaims = filterClaimsForUser(
      allClaims,
      context.identityPermissions
    );

    // Transform result to include human-readable role and identity data
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
      identity: identity,
      claims: filteredClaims,
      isRegistered: !!identity,
      createdAt: userData.createdAt?.toISOString(),
      lastLoginAt: userData.lastLoginAt?.toISOString(),
    } as User;
  });
