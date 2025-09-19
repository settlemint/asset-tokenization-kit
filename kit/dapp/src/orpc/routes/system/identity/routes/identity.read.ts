import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { hasRole } from "@/orpc/helpers/access-control-helpers";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { systemRouter } from "@/orpc/procedures/system.router";
import {
  IdentityReadSchema,
  IdentitySchema,
  IdentityUnifiedResponseSchema,
  type Identity,
} from "@/orpc/routes/system/identity/routes/identity.read.schema";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import type { IdentityClaim } from "@atk/zod/claim";
import countries from "i18n-iso-countries";

// Unified query to get identity by wallet address OR identity ID
const READ_IDENTITY_QUERY = theGraphGraphql(`
  query ReadIdentityQuery(
    $userAddress: String
    $identityId: Bytes
    $identityFactory: String
    $registryStorage: String!
  ) {
    identities(
      where: {
        or: [
          {
            and: [
              { identityFactory: $identityFactory }
              { account: $userAddress }
            ]
          }
          { id: $identityId }
        ]
      }
      first: 1
    ) {
      id
      account {
        id
        contractName
      }
      registered(where: { registryStorage: $registryStorage }) {
        id
        country
      }
      claims {
        id
        name
        revoked
        issuer {
          id
        }
        values {
          key
          value
        }
      }
    }
  }
`);

/**
 * Identity read route handler.
 *
 * Retrieves comprehensive identity information by either wallet address or identity ID.
 * Returns full identity data including claims and registration details.
 *
 * @auth Required - User must be authenticated and system must be onboarded
 * @permissions Requires "read" permission or always allows if reading own identity
 * @param input - Wallet address or identity ID to read identity for
 * @param context - ORPC context with system and user information
 * @returns Identity information including claims and registration status
 * @throws NOT_FOUND - If identity doesn't exist for the given input
 */
export const identityRead = systemRouter.system.identity.read
  .use(
    blockchainPermissionsMiddleware<typeof IdentityReadSchema>({
      requiredRoles: SYSTEM_PERMISSIONS.identityRead,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
      alwaysAllowIf: (context, input) => {
        // Always allow if reading by wallet address and it's the user's own wallet
        if ("wallet" in input && input.wallet === context.auth?.user.wallet) {
          return true;
        }
        // For identity ID queries, we can't determine ownership at middleware level
        // Permission check happens in the handler after querying the identity
        if ("identityId" in input) {
          return true;
        }
        return false;
      },
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { system, theGraphClient } = context;

    // Determine input parameters for unified query
    const queryInput = {
      userAddress: "wallet" in input ? input.wallet.toLowerCase() : null,
      identityId: "identityId" in input ? input.identityId.toLowerCase() : null,
      identityFactory: system.identityFactory.id.toLowerCase(),
      registryStorage: system.identityRegistryStorage.id.toLowerCase(),
    };

    const identifier = "wallet" in input ? input.wallet : input.identityId;

    // Execute unified query
    const result = await theGraphClient.query(READ_IDENTITY_QUERY, {
      input: queryInput,
      output: IdentityUnifiedResponseSchema,
    });

    const identity = result.identities?.[0];

    // For identity ID queries, check if the user has permission to view this identity
    // This happens after the query to avoid duplicate queries in the middleware
    if (identity && "identityId" in input && context.auth?.user.wallet) {
      const accessControl =
        context.system?.systemAccessManager?.accessControl;
      const userWallet = context.auth.user.wallet.toLowerCase();
      const hasPermission = SYSTEM_PERMISSIONS.identityRead.any.some((role) =>
        hasRole(userWallet, role, accessControl)
      );

      // If user doesn't have the read permission, only allow if it's their own identity
      if (
        !hasPermission &&
        identity.account.id.toLowerCase() !== userWallet
      ) {
        throw errors.FORBIDDEN({
          message: `You don't have permission to view this identity`,
        });
      }
    }

    if (!identity) {
      throw errors.NOT_FOUND({
        message: `No identity found for ${identifier}`,
      });
    }

    // Extract country from registered identity (first registration record)
    const registeredIdentity = identity.registered?.[0];
    const accountCountry = registeredIdentity?.country;

    // Determine if this is a contract or account based on contractName
    const isContract = Boolean(identity.account.contractName);

    const resultIdentity: Identity = {
      id: identity.id,
      account: {
        id: identity.account.id,
        contractName: identity.account.contractName ?? null,
      },
      isContract,
      registered: accountCountry
        ? {
            isRegistered: true,
            country: countries.numericToAlpha2(String(accountCountry)) ?? "",
          }
        : undefined,
      claims: identity.claims.map((claim: IdentityClaim) => ({
        id: claim.id,
        name: claim.name,
        revoked: claim.revoked,
        issuer: claim.issuer,
        values: claim.values,
      })),
    };

    // Return the comprehensive identity information
    return IdentitySchema.parse(resultIdentity);
  });
