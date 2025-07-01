import { orpc } from "@/orpc";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";

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
export const me = onboardedRouter.account.me
  .use(theGraphMiddleware)
  .handler(async ({ context }) => {
    try {
      return await orpc.account.read.call({
        wallet: context.auth.user.wallet,
      });
    } catch {
      return null;
    }
  });
