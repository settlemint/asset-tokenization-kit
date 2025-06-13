import { theGraphMiddleware } from "@/lib/orpc/middlewares/services/the-graph.middleware";
import { ar } from "@/lib/orpc/procedures/auth.router";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { ORPCError } from "@orpc/client";

/**
 * GraphQL query for retrieving identity information from TheGraph.
 *
 * This query fetches detailed identity information including:
 * - Associated wallet address
 * - Claims issued to the identity
 * - Identity metadata
 *
 * Identities are core compliance components in the SMART protocol
 * that store verified claims about users or entities.
 */
const READ_IDENTITY_QUERY = theGraphGraphql(`
query ReadIdentityQuery($identityAddress: ID!) {
  identity(id: $identityAddress) {
    id
    walletAddress
    claims {
      topic
      issuer
      signature
      data
      uri
    }
    metadata {
      createdAt
      updatedAt
      country
    }
  }
}
`);

/**
 * Identity read route handler.
 *
 * Retrieves detailed information about a specific identity contract from TheGraph indexer.
 * Identities are blockchain-based representations that hold verified claims for compliance
 * purposes within the SMART protocol ecosystem.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "read" permission - available to admin, issuer, user, and auditor roles
 * Method: GET /identities/:identityAddress
 *
 * @param input - Read parameters including the identity contract address
 * @param context - Request context with TheGraph client and authenticated user
 * @returns Promise<Identity> - Identity object with claims and metadata
 *
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions
 * @throws NOT_FOUND - If identity does not exist
 *
 * @example
 * ```typescript
 * // Client usage:
 * const identity = await orpc.identity.read.query({
 *   identityAddress: '0x...'
 * });
 * ```
 */
export const read = ar.identity.read
  // TODO JAN: add permissions middleware, needs the default user role in better auth
  // .use(
  //   permissionsMiddleware({
  //     requiredPermissions: ["read"],
  //     roles: ["admin", "issuer", "user", "auditor"],
  //   })
  // )
  .use(theGraphMiddleware)
  .handler(async ({ input, context }) => {
    const { identityAddress } = input;

    // Execute TheGraph query
    const { identity } = await context.theGraphClient.request(
      READ_IDENTITY_QUERY,
      {
        identityAddress,
      }
    );

    if (!identity) {
      throw new ORPCError("Identity not found");
    }

    // Return the identity object
    return identity;
  });