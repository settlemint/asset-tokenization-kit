import { AccessControlFragment } from "@/lib/fragments/the-graph/access-control-fragment";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { Context } from "@/orpc/context/context";
import { mapUserRoles } from "@/orpc/helpers/role-validation";
import { baseRouter } from "@/orpc/procedures/base.router";
import {
  Token,
  TokenReadResponseSchema,
  TokenSchema,
} from "@/orpc/routes/token/routes/token.read.schema";
import {
  TOKEN_PERMISSIONS,
  TOKEN_TRUSTED_ISSUER_REQUIREMENTS,
} from "@/orpc/routes/token/token.permissions";
import type { AccessControlRoles } from "@atk/zod/access-control-roles";
import { isEthereumAddress } from "@atk/zod/ethereum-address";
import { satisfiesRoleRequirement } from "@atk/zod/role-requirement";
import { createLogger } from "@settlemint/sdk-utils/logging";
import countries from "i18n-iso-countries";

const logger = createLogger();

const READ_TOKEN_QUERY = theGraphGraphql(
  `
  query ReadTokenQuery($id: ID!, $identityFactory: String!, $userWallet: Bytes!) {
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
          account {
            id
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
        schedule {
          id
          denominationAsset {
            id
            decimals
            symbol
          }
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
    trustedIssuers(where: { account_: { id: $userWallet } }) {
      id
      claimTopics {
        name
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
      userWallet: auth.user.wallet,
    },
    output: TokenReadResponseSchema,
  });

  const token = result.token;
  if (!token) {
    throw errors.NOT_FOUND({
      message: `Token with address '${tokenAddress}' not found`,
    });
  }

  const userTrustedIssuerTopics = result.trustedIssuers
    ? result.trustedIssuers.flatMap((issuer) =>
        issuer.claimTopics.map((topic) => topic.name)
      )
    : [];

  const identity = token.account?.identities?.[0];
  const identityAccount = identity?.account ?? undefined;

  if (!identityAccount) {
    throw errors.INTERNAL_SERVER_ERROR({
      message: "Token identity found without linked account",
      data: { tokenId: token.id, identityId: identity?.id },
    });
  }

  const userRoles = mapUserRoles(auth.user.wallet, token.accessControl);

  const tokenContextResult: Token = {
    ...token,
    identity: identity
      ? {
          id: identity.id,
          account: {
            id: identityAccount.id,
            contractName: identityAccount.contractName ?? null,
          },
          isContract: Boolean(identity.account?.contractName),
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
            forcedTransfer: false,
            unpause: false,
            updateCollateral: false,
            withdrawDenominationAsset: false,
            topUpDenominationAsset: false,
          };

        const userRoleList = Object.entries(userRoles)
          .filter(([_, hasRole]) => hasRole)
          .map(([role]) => role) as AccessControlRoles[];

        // Update based on user roles using the flexible role requirement system
        Object.entries(TOKEN_PERMISSIONS).forEach(
          ([action, roleRequirement]) => {
            const rolesSatisfied = satisfiesRoleRequirement(
              userRoleList,
              roleRequirement
            );

            const trustedTopics =
              TOKEN_TRUSTED_ISSUER_REQUIREMENTS[
                action as keyof typeof TOKEN_TRUSTED_ISSUER_REQUIREMENTS
              ] ?? [];

            const trustedIssuerSatisfied =
              trustedTopics.length === 0 ||
              trustedTopics.every((topic) =>
                userTrustedIssuerTopics.includes(topic)
              );

            initialActions[action as keyof typeof TOKEN_PERMISSIONS] =
              rolesSatisfied && trustedIssuerSatisfied;
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
