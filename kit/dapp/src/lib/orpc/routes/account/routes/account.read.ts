import { theGraphMiddleware } from "@/lib/orpc/middlewares/services/the-graph.middleware";
import { ar } from "@/lib/orpc/procedures/auth.router";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { ORPCError } from "@orpc/client";

/**
 * GraphQL query for retrieving SMART systems from TheGraph.
 *
 * This query fetches a paginated list of system contracts with support for:
 * - Offset-based pagination (skip/first)
 * - Configurable sort order (ascending/descending)
 * - Custom ordering by any system field
 *
 * Systems represent deployed SMART protocol instances that manage
 * tokenized assets and their associated compliance infrastructure.
 */
const READ_ACCOUNT_QUERY = theGraphGraphql(`
query ReadAccountQuery($walletAddress: ID!) {
  account(id: $walletAddress) {
    id
    identity {
      claims {
        name
        revoked
        values {
          key
          value
        }
      }
    }
  }
}
`);

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
 *
 * @param input - List parameters including pagination and sorting options
 * @param context - Request context with TheGraph client and authenticated user
 * @returns Promise<System[]> - Array of system objects with their blockchain addresses
 *
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions
 *
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
export const read = ar.account.read
  // TODO JAN: add permissions middleware, needs the default user role in better auth
  // .use(
  //   permissionsMiddleware({
  //     requiredPermissions: ["read"],
  //     roles: ["admin", "issuer", "user", "auditor"],
  //   })
  // )
  .use(theGraphMiddleware)
  .handler(async ({ input, context }) => {
    const { walletAddress } = input;

    // Execute TheGraph query with pagination and sorting parameters
    const { account } = await context.theGraphClient.request(
      READ_ACCOUNT_QUERY,
      {
        walletAddress,
      }
    );

    if (!account) {
      throw new ORPCError("Account not found");
    }

    // Return the array of system contracts
    return account;
  });
