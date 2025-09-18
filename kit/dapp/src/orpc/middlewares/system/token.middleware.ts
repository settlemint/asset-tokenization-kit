import { AccessControlFragment } from "@/lib/fragments/the-graph/access-control-fragment";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { Context } from "@/orpc/context/context";
import { mapUserRoles } from "@/orpc/helpers/role-validation";
import { baseRouter } from "@/orpc/procedures/base.router";
import {
  TokenSchema,
  type Token,
} from "@/orpc/routes/token/routes/token.read.schema";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import type { AccessControlRoles } from "@atk/zod/access-control-roles";
import { identityClaim } from "@atk/zod/claim";
import { ethereumAddress, isEthereumAddress } from "@atk/zod/ethereum-address";
import { satisfiesRoleRequirement } from "@atk/zod/role-requirement";
import { createLogger } from "@settlemint/sdk-utils/logging";
import countries from "i18n-iso-countries";
import z from "zod";

const logger = createLogger();

const READ_TOKEN_QUERY = theGraphGraphql(
  `
  query ReadTokenQuery($id: ID!, $identityFactory: String!) {
    token(id: $id) {
      id
      type
      createdAt
      name
      symbol
      decimals
      totalSupply
      extensions
      implementsERC3643
      implementsSMART
      account {
        identities(
          where: { identityFactory: $identityFactory }
          first: 1
        ) {
          id
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
          registered(first: 1) {
            country
          }
        }
      }
      pausable {
        paused
      }
      capped {
        cap
      }
      createdBy {
        id
      }
      redeemable {
        redeemedAmount
      }
      bond {
        faceValue
        isMatured
        maturityDate
        denominationAssetNeeded
        denominationAsset {
          id
          decimals
          symbol
        }
      }
      fund {
        managementFeeBps
      }
      collateral {
        collateral
        expiryTimestamp
      }
      accessControl {
        ...AccessControlFragment
      }
      yield: yield_ {
        id
        schedule {
          id
        }
      }
      complianceModuleConfigs {
        id
        complianceModule {
          id
          typeId
        }
      }
      stats {
        totalValueInBaseCurrency
        balancesCount
      }
    }
  }
  `,
  [AccessControlFragment]
);

/**
 * Middleware to inject the token context into the request context.
 * @returns The middleware function.
 */
export const tokenMiddleware = baseRouter.middleware<
  Required<Pick<Context, "token">>,
  unknown
>(async ({ next, context, errors }, input) => {
  // Always fetch fresh token data - no caching
  const { auth, system, theGraphClient } = context;

  // Early authorization check before making expensive queries
  if (!auth?.user.wallet) {
    logger.warn("sessionMiddleware should be called before tokenMiddleware");
    throw errors.UNAUTHORIZED({
      message: "Authentication required to access token information",
    });
  }

  if (!theGraphClient) {
    throw errors.INTERNAL_SERVER_ERROR({
      message: "theGraphMiddleware should be called before tokenMiddleware",
    });
  }

  if (!system?.identityFactory?.id) {
    throw errors.INTERNAL_SERVER_ERROR({
      message: "systemMiddleware should be called before tokenMiddleware",
    });
  }

  const tokenAddress = getTokenAddress(input);

  if (!isEthereumAddress(tokenAddress)) {
    throw errors.INPUT_VALIDATION_FAILED({
      message: "Token address is not a valid Ethereum address",
      data: {
        errors: ["Token address is not a valid Ethereum address"],
      },
    });
  }

  // Fetch token data from The Graph
  const result = await theGraphClient.query(READ_TOKEN_QUERY, {
    input: {
      id: tokenAddress,
      identityFactory: system.identityFactory.id,
    },
    output: z.object({
      token: TokenSchema.omit({ identity: true }).extend({
        account: z.object({
          identities: z
            .array(
              z.object({
                id: ethereumAddress,
                claims: z.array(identityClaim),
                registered: z
                  .array(
                    z.object({
                      country: z.number(),
                    })
                  )
                  .nullable()
                  .optional(),
              })
            )
            .nullable()
            .optional(),
        }),
      }),
    }),
  });

  const token = result.token;
  const identity = token.account?.identities?.[0];

  const userRoles = mapUserRoles(auth.user.wallet, token.accessControl);

  const tokenContextResult: Token = {
    ...token,
    identity: identity
      ? {
          id: identity.id,
          account: identity.id,
          claims: identity.claims,
          registered: identity.registered?.[0]
            ? {
                isRegistered: true,
                country:
                  countries.numericToAlpha2(
                    String(identity.registered[0].country)
                  ) ?? "",
              }
            : undefined,
        }
      : undefined,
    userPermissions: {
      roles: userRoles,
      // TODO: implement logic which checks if the user is allowed to interact with the token
      // user is not allowed when in the block list or when it requires an allow list
      // Another reason could be that the user is a citizen of a blocked country
      // We should do this in the subgraph, more fine grained so we can derive the reason here
      isAllowed: true,
      notAllowedReason: undefined,
      actions: (() => {
        // Initialize all actions as false
        const initialActions: Record<keyof typeof TOKEN_PERMISSIONS, boolean> =
          {
            burn: false,
            grantRole: false,
            revokeRole: false,
            mint: false,
            pause: false,
            addComplianceModule: false,
            approve: false,
            forcedRecover: false,
            freezeAddress: false,
            freezePartial: false,
            unfreezePartial: false,
            recoverERC20: false,
            recoverTokens: false,
            redeem: false,
            mature: false,
            removeComplianceModule: false,
            setCap: false,
            setYieldSchedule: false,
            transfer: false,
            unpause: false,
            updateCollateral: false,
            withdrawDenominationAsset: false,
          };

        const userRoleList = Object.entries(userRoles)
          .filter(([_, hasRole]) => hasRole)
          .map(([role]) => role) as AccessControlRoles[];

        // Update based on user roles using the flexible role requirement system
        Object.entries(TOKEN_PERMISSIONS).forEach(
          ([action, roleRequirement]) => {
            initialActions[action as keyof typeof TOKEN_PERMISSIONS] =
              satisfiesRoleRequirement(userRoleList, roleRequirement);
          }
        );

        return initialActions;
      })(),
    },
  };

  const tokenContext = TokenSchema.parse(tokenContextResult);

  return next({
    context: {
      token: tokenContext,
    },
  });
});

/**
 * Get the token address from the input.
 * @param input - The input object.
 * @returns The token address.
 */
function getTokenAddress(input: unknown) {
  if (input === null || input === undefined) {
    return null;
  }
  if (typeof input === "string") {
    return input;
  }
  if (typeof input === "object" && "tokenAddress" in input) {
    return input.tokenAddress;
  }
  if (typeof input === "object" && "contract" in input) {
    return input.contract;
  }
  return null;
}
