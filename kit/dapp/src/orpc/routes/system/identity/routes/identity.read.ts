import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { systemRouter } from "@/orpc/procedures/system.router";
import {
  IdentityReadSchema,
  IdentityResponseSchema,
  IdentitySchema,
  type Identity,
} from "@/orpc/routes/system/identity/routes/identity.read.schema";
import countries from "i18n-iso-countries";

// Query to get comprehensive identity information including claims
const READ_IDENTITY_QUERY = theGraphGraphql(`
  query ReadIdentityQuery(
    $userAddress: String!
    $identityFactory: String!
    $registryStorage: String!
  ) {
    identities(
      where: {
        identityFactory: $identityFactory
        account: $userAddress
      }
      first: 1
    ) {
      id
      account {
        id
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
      registered(
        where: { registryStorage: $registryStorage }
        first: 1
      ) {
        id
        country
      }
    }
  }
`);

/**
 * Identity read route handler.
 *
 * Retrieves comprehensive identity information for the given address.
 * Returns full identity data including claims and registration details.
 *
 * @auth Required - User must be authenticated and system must be onboarded
 * @permissions Requires "read" permission or always allows if reading own identity
 * @param input - Address to read identity for
 * @param context - ORPC context with system and user information
 * @returns Identity information including claims and registration status
 * @throws NOT_FOUND - If identity doesn't exist for the address
 */
export const identityRead = systemRouter.system.identity.read
  .use(
    offChainPermissionsMiddleware<typeof IdentityReadSchema>({
      requiredPermissions: { account: ["read"] },
      alwaysAllowIf: (context, input) =>
        input.account === context.auth?.user.wallet,
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { account } = input;
    const { system, theGraphClient } = context;

    // Execute TheGraph query with comprehensive identity data
    const result = await theGraphClient.query(READ_IDENTITY_QUERY, {
      input: {
        userAddress: account.toLowerCase(),
        identityFactory: system.identityFactory.id.toLowerCase(),
        registryStorage: system.identityRegistryStorage.id.toLowerCase(),
      },
      output: IdentityResponseSchema,
    });

    // Extract identity and registration data
    const identity = result.identities?.[0];

    if (!identity) {
      throw errors.NOT_FOUND({
        message: `No identity found for address ${account}`,
      });
    }

    const registeredEntry = identity.registered?.[0];

    const resultIdentity: Identity = {
      id: identity.id,
      account: identity.account.id,
      registered: registeredEntry
        ? {
            isRegistered: true,
            country:
              countries.numericToAlpha2(String(registeredEntry.country)) ?? "",
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
