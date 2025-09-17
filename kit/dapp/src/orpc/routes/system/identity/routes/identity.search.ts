import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { systemRouter } from "@/orpc/procedures/system.router";
import {
  IdentitySearchResponseSchema,
  IdentitySearchResultSchema,
  IdentitySearchSchema,
  type IdentitySearchResult,
} from "@/orpc/routes/system/identity/routes/identity.search.schema";
import countries from "i18n-iso-countries";

// Query to search identity by account address or identity contract address
const SEARCH_IDENTITY_QUERY = theGraphGraphql(`
  query SearchIdentityQuery(
    $userAddress: String
    $identityAddress: Bytes
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
          { id: $identityAddress }
        ]
      }
      first: 1
    ) {
      id
      account {
        id
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
 * Identity search route handler.
 *
 * Searches for identity information by account address or identity contract address without claims.
 * Returns basic identity data including registration details or null if not found.
 *
 * @auth Required - User must be authenticated and system must be onboarded
 * @permissions Requires "read" permission or always allows if searching own identity
 * @param input - Account address or identity contract address to search for
 * @param context - ORPC context with system and user information
 * @returns Identity information without claims or null if not found
 */
export const identitySearch = systemRouter.system.identity.search
  .use(
    offChainPermissionsMiddleware<typeof IdentitySearchSchema>({
      requiredPermissions: { account: ["read"] },
      alwaysAllowIf: (context, input) =>
        input.account === context.auth?.user.wallet,
    })
  )
  .handler(async ({ input, context }) => {
    const { account, address } = input;
    const { system, theGraphClient } = context;

    // Execute single query with OR condition
    const result = await theGraphClient.query(SEARCH_IDENTITY_QUERY, {
      input: {
        userAddress: account?.toLowerCase() || null,
        identityAddress: address?.toLowerCase() || null,
        identityFactory: account
          ? system.identityFactory.id.toLowerCase()
          : null,
        registryStorage: system.identityRegistryStorage.id.toLowerCase(),
      },
      output: IdentitySearchResponseSchema,
    });

    // Extract identity and registration data
    const identity = result.identities?.[0];

    if (!identity) {
      return null;
    }

    const registeredEntry = identity.registered?.[0];

    const resultIdentity: IdentitySearchResult = {
      id: identity.id,
      account: identity.account.id,
      registered: registeredEntry
        ? {
            isRegistered: true,
            country:
              countries.numericToAlpha2(String(registeredEntry.country)) ?? "",
          }
        : undefined,
    };

    // Return the basic identity information
    return IdentitySearchResultSchema.parse(resultIdentity);
  });
