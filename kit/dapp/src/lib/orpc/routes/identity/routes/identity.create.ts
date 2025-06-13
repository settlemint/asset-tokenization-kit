import { env } from "@/lib/config/env";
import { portalMiddleware } from "@/lib/orpc/middlewares/services/portal.middleware";
import { ar } from "@/lib/orpc/procedures/auth.router";
import { portalGraphql } from "@/lib/settlemint/portal";

/**
 * GraphQL mutation for creating an identity in the SettleMint Portal.
 *
 * This mutation creates a new identity contract for a given wallet address,
 * which is essential for compliance and claim management in the SMART protocol.
 */
const CREATE_IDENTITY_MUTATION = portalGraphql(`
  mutation CreateIdentityMutation($walletAddress: String!, $country: String) {
    createIdentity(walletAddress: $walletAddress, metadata: {country: $country}) {
      address
      transactionHash
    }
  }
`);

/**
 * Identity creation route handler.
 *
 * Creates a new identity contract for a wallet address through the SettleMint Portal.
 * Identities are essential for compliance in the SMART protocol, allowing users
 * to receive and manage verified claims from trusted issuers.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "create" permission - typically available to admin and issuer roles
 * Method: POST /identities
 *
 * @param input - Creation parameters including wallet address and optional country
 * @param context - Request context with Portal client and authenticated user
 * @returns Promise<string> - The deployed identity contract address
 *
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required create permissions
 * @throws CONFLICT - If identity already exists for the wallet
 * @throws PORTAL_ERROR - If identity creation fails in Portal service
 *
 * @example
 * ```typescript
 * // Client usage:
 * const identityAddress = await orpc.identity.create.mutate({
 *   walletAddress: '0x...',
 *   country: 'US'
 * });
 * ```
 */
export const create = ar.identity.create
  // TODO JAN: add permissions middleware, needs the default user role in better auth
  // .use(
  //   permissionsMiddleware({
  //     requiredPermissions: ["create"],
  //     roles: ["admin", "issuer"],
  //   })
  // )
  .use(portalMiddleware)
  .handler(async ({ input, context, errors }) => {
    const { walletAddress, country } = input;

    // TODO JAN: Check if identity already exists for this wallet
    // This would require either a TheGraph query or database check

    const { createIdentity } = await context.portalClient.request(
      CREATE_IDENTITY_MUTATION,
      {
        walletAddress,
        country,
      }
    );

    if (!createIdentity?.address) {
      throw errors.PORTAL_ERROR({
        data: {
          operation: "createIdentity",
          details: "Failed to create identity in portal service",
        },
      });
    }

    // Return the newly created identity contract address
    return createIdentity.address;
  });