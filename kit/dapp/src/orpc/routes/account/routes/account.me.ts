import { publicRouter } from "@/orpc/procedures/public.router";
import { read } from "@/orpc/routes/account/routes/account.read";
import { call } from "@orpc/server";

/**
 * System listing route handler.
 *
 * Retrieves a paginated list of SMART system contracts from TheGraph indexer.
 * Systems are the core infrastructure contracts that manage tokenized assets,
 * compliance modules, identity registries, and access control within the SMART
 * protocol ecosystem.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "read" permission - available to admin, issuer, user, and auditor roles
 * Method: GET /systems
 * @param input - List parameters including pagination and sorting options
 * @param context - Request context with TheGraph client and authenticated user
 * @returns Promise<System[]> - Array of system objects with their blockchain addresses
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions
 * @example
 * ```typescript
 * // Client usage:
 * const systems = await orpc.system.list.query({
 *   offset: 0,
 *   limit: 20,
 *   orderBy: 'deployedAt',
 *   orderDirection: 'desc'
 * });
 * ```
 */
export const me = publicRouter.account.me.handler(
  async ({ context, errors }) => {
    if (!context.auth) {
      throw errors.UNAUTHORIZED();
    }
    try {
      return await call(
        read,
        {
          wallet: context.auth.user.wallet,
        },
        {
          context,
        }
      );
    } catch {
      return null;
    }
  }
);
