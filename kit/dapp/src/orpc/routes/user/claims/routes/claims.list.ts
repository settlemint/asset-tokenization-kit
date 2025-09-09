import { user } from "@/lib/db/schema";
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
import {
  createNullWalletIdentityResult,
  fetchUserIdentity,
} from "@/orpc/routes/user/utils/identity.util";
import { eq } from "drizzle-orm";
import { ClaimsListInputSchema } from "./claims.list.schema";

/**
 * Claims list route handler.
 *
 * Retrieves claims information for a specific user by either their
 * internal ID or wallet address. This endpoint provides focused
 * claims data without the full user profile information.
 *
 * **Key Differences from user.read/list:**
 * - ✅ **Lightweight response** - Only claims and identity data
 * - ✅ Optimized for claims management UI components
 * - ✅ Same authentication/permission model as user routes
 * - ❌ No KYC profile, role, or full user data included
 *
 * **Use Cases:**
 * - Claims management dashboards
 * - Identity verification widgets
 * - Compliance status checks
 * - User claim audit trails
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "list" permission on users resource
 * Method: GET /user/claims/list
 *
 * @param input - Query parameters with either {userId} or {wallet}
 * @param context - Request context with database and TheGraph connections
 * @returns Promise<ClaimsListOutput> - Claims data and identity information
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required permissions
 * @throws NOT_FOUND - If user is not found
 * @throws INTERNAL_SERVER_ERROR - If database/TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get claims by user ID
 * const claims = await orpc.user.claims.list.query({
 *   type: "userId",
 *   userId: "user-123"
 * });
 *
 * // Get claims by wallet address
 * const claims = await orpc.user.claims.list.query({
 *   type: "wallet",
 *   wallet: "0x1234567890123456789012345678901234567890"
 * });
 * ```
 */
export const list = authRouter.user.claims.list
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
    identityPermissionsMiddleware<typeof ClaimsListInputSchema>({
      getTargetUserId: ({ input }) =>
        input.type === "userId" ? input.userId : undefined,
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ context, input, errors }) => {
    // Build the query condition based on input type
    const whereCondition =
      input.type === "userId"
        ? eq(user.id, input.userId)
        : eq(user.wallet, input.wallet);

    // Execute query to find the user
    const result = await context.db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        wallet: user.wallet,
      })
      .from(user)
      .where(whereCondition)
      .limit(1);

    if (result.length === 0) {
      throw errors.NOT_FOUND({
        message:
          input.type === "userId"
            ? `User with ID ${input.userId} not found`
            : `User with wallet ${input.wallet} not found`,
      });
    }

    const userData = result[0];
    if (!userData) {
      throw errors.NOT_FOUND({
        message:
          input.type === "userId"
            ? `User with ID ${input.userId} not found`
            : `User with wallet ${input.wallet} not found`,
      });
    }

    // Handle users without wallets
    if (!userData.wallet) {
      const identityResult = createNullWalletIdentityResult();
      return {
        claims: identityResult.claims,
        identity: identityResult.identity,
        isRegistered: identityResult.isRegistered,
        wallet: userData.wallet,
      };
    }

    // Fetch identity data from TheGraph
    const identityResult = await fetchUserIdentity({
      wallet: userData.wallet,
      context,
    });

    // Filter claims based on user's permissions
    const filteredClaims = filterClaimsForUser(
      identityResult.claims,
      context.identityPermissions
    );

    return {
      claims: filteredClaims,
      identity: identityResult.identity,
      isRegistered: identityResult.isRegistered,
      wallet: userData.wallet,
    };
  });
