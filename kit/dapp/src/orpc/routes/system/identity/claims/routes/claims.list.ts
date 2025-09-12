import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import { fetchUserIdentity } from "@/orpc/routes/user/utils/identity.util";

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
 * Method: GET /system/identity/claims/list
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
 * // Get claims by wallet address
 * const claims = await orpc.system.identity.claims.list.query({
 *   wallet: "0x1234567890123456789012345678901234567890"
 * });
 * ```
 */
export const list = authRouter.system.identity.claims.list
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.claimList,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
  )
  .handler(async ({ context, input }) => {
    // Fetch identity data from TheGraph
    const identityResult = await fetchUserIdentity({
      wallet: input.accountId,
      context,
    });

    return {
      claims: identityResult.claims ?? [],
      identity: identityResult.identity,
      isRegistered: identityResult.isRegistered,
      accountId: input.accountId,
    };
  });
