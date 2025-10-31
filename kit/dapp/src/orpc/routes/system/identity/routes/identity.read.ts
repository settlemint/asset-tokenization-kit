import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { hasRole } from "@/orpc/helpers/access-control-helpers";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { systemRouter } from "@/orpc/procedures/system.router";
import {
  IdentitySchema,
  IdentityUnifiedResponseSchema,
  type Identity,
} from "@/orpc/routes/system/identity/routes/identity.read.schema";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import type { IdentityClaim } from "@atk/zod/claim";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import countries from "i18n-iso-countries";
import { z } from "zod";

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

const IdentityReadByWalletSchema = z.object({
  wallet: ethereumAddress.describe(
    "The wallet address of the user to read the identity for"
  ),
});

const IdentityReadByIdSchema = z.object({
  identityId: ethereumAddress.describe(
    "The ID of the identity contract to read"
  ),
});

/**
 * Identity read by wallet route handler.
 */
export const identityReadByWallet = systemRouter.system.identity.readByWallet
  .use(
    blockchainPermissionsMiddleware<typeof IdentityReadByWalletSchema>({
      requiredRoles: SYSTEM_PERMISSIONS.identityRead,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
      alwaysAllowIf: (context, input) => {
        return input.wallet === context.auth?.user.wallet;
      },
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { system, theGraphClient } = context;

    const queryInput = {
      userAddress: input.wallet.toLowerCase(),
      identityId: null,
      identityFactory: system.identityFactory.id.toLowerCase(),
      registryStorage: system.identityRegistryStorage.id.toLowerCase(),
    };

    const result = await theGraphClient.query(READ_IDENTITY_QUERY, {
      input: queryInput,
      output: IdentityUnifiedResponseSchema,
    });

    const identity = result.identities?.[0];

    if (!identity) {
      throw errors.NOT_FOUND({
        message: `No identity found for ${input.wallet}`,
      });
    }

    const registeredIdentity = identity.registered?.[0];
    const accountCountry = registeredIdentity?.country;
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

    return IdentitySchema.parse(resultIdentity);
  });

/**
 * Identity read by ID route handler.
 */
export const identityReadById = systemRouter.system.identity.readById
  .use(
    blockchainPermissionsMiddleware<typeof IdentityReadByIdSchema>({
      requiredRoles: SYSTEM_PERMISSIONS.identityRead,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
      alwaysAllowIf: () => {
        // Always allow - permission check happens in handler after querying
        return true;
      },
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { system, theGraphClient } = context;

    const queryInput = {
      userAddress: null,
      identityId: input.identityId.toLowerCase(),
      identityFactory: system.identityFactory.id.toLowerCase(),
      registryStorage: system.identityRegistryStorage.id.toLowerCase(),
    };

    const result = await theGraphClient.query(READ_IDENTITY_QUERY, {
      input: queryInput,
      output: IdentityUnifiedResponseSchema,
    });

    const identity = result.identities?.[0];

    // Check permissions after querying to see if user owns this identity
    if (identity && context.auth?.user.wallet) {
      const accessControl = context.system?.systemAccessManager?.accessControl;
      const userWallet = context.auth.user.wallet.toLowerCase();
      const hasPermission = SYSTEM_PERMISSIONS.identityRead.any.some((role) =>
        hasRole(userWallet, role, accessControl)
      );

      if (!hasPermission && identity.account.id.toLowerCase() !== userWallet) {
        throw errors.FORBIDDEN({
          message: `You don't have permission to view this identity`,
        });
      }
    }

    if (!identity) {
      throw errors.NOT_FOUND({
        message: `No identity found for ${input.identityId}`,
      });
    }

    const registeredIdentity = identity.registered?.[0];
    const accountCountry = registeredIdentity?.country;
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

    return IdentitySchema.parse(resultIdentity);
  });
