import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { hasRole } from "@/orpc/helpers/access-control-helpers";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { systemRouter } from "@/orpc/procedures/system.router";
import {
  IdentityByIdResponseSchema,
  IdentityByWalletResponseSchema,
  IdentityReadSchema,
  IdentitySchema,
  type Identity,
} from "@/orpc/routes/system/identity/routes/identity.read.schema";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import countries from "i18n-iso-countries";

// Query to get identity by wallet address
const READ_IDENTITY_BY_WALLET_QUERY = theGraphGraphql(`
  query ReadIdentityByWalletQuery(
    $userAddress: String!
    $identityFactory: String!
    $registryStorage: String!
  ) {
    identities(
      where: {
        identityFactory: $identityFactory
        account: $userAddress
        registryStorage: $registryStorage
      }
      first: 1
    ) {
      id
      account {
        id
        country
        contractName
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

// Query to get identity by ID directly
const READ_IDENTITY_BY_ID_QUERY = theGraphGraphql(`
  query ReadIdentityByIdQuery(
    $identityId: ID!
  ) {
    identity(id: $identityId) {
      id
      account {
        id
        country
        contractName
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
        if ("wallet" in input && input.wallet === context.auth?.user.wallet) {
          return true;
        }
        return false;
      },
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { system, theGraphClient } = context;
    let identity;
    let identifier: string;

    // Query based on input type
    if ("wallet" in input) {
      identifier = input.wallet;

      // Execute TheGraph query by wallet address
      const result = await theGraphClient.query(READ_IDENTITY_BY_WALLET_QUERY, {
        input: {
          userAddress: input.wallet.toLowerCase(),
          identityFactory: system.identityFactory.id.toLowerCase(),
          registryStorage: system.identityRegistryStorage.id.toLowerCase(),
        },
        output: IdentityByWalletResponseSchema,
      });

      identity = result.identities?.[0];
    } else {
      identifier = input.identityId;

      // Execute TheGraph query by identity ID
      const result = await theGraphClient.query(READ_IDENTITY_BY_ID_QUERY, {
        input: {
          identityId: input.identityId.toLowerCase(),
        },
        output: IdentityByIdResponseSchema,
      });

      identity = result.identity;

      // For identity ID queries, check if the user has permission to view this identity
      // This happens after the query to avoid duplicate queries in the middleware
      if (
        identity &&
        context.auth?.user.wallet &&
        context.system?.systemAccessManager?.accessControl
      ) {
        const hasPermission = hasRole(
          context.auth.user.wallet,
          SYSTEM_PERMISSIONS.identityRead.any[0],
          context.system.systemAccessManager.accessControl
        );

        // If user doesn't have the read permission, only allow if it's their own identity
        if (
          !hasPermission &&
          identity.account.id.toLowerCase() !==
            context.auth.user.wallet.toLowerCase()
        ) {
          throw errors.FORBIDDEN({
            message: `You don't have permission to view this identity`,
          });
        }
      }
    }

    if (!identity) {
      throw errors.NOT_FOUND({
        message: `No identity found for ${identifier}`,
      });
    }

    const accountCountry = identity.account.country;

    // Determine if this is a contract or account based on contractName
    const isContract = Boolean(identity.account.contractName);

    const resultIdentity: Identity = {
      id: identity.id,
      account: isContract ? null : { id: identity.account.id },
      contract: isContract
        ? {
            id: identity.account.id,
            contractName: identity.account.contractName ?? null,
          }
        : null,
      registered: accountCountry
        ? {
            isRegistered: true,
            country: countries.numericToAlpha2(String(accountCountry)) ?? "",
          }
        : undefined,
      claims:
        identity.claims
          .filter((claim) => !claim.revoked)
          .map((claim) => ({
            id: claim.id,
            name: claim.name,
            revoked: claim.revoked,
            issuer: claim.issuer,
            values: claim.values,
          })) ?? [],
    };

    // Return the comprehensive identity information
    return IdentitySchema.parse(resultIdentity);
  });
