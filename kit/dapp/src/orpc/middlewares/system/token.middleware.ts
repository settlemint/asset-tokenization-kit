import type { AccessControlRoles } from "@/lib/fragments/the-graph/access-control-fragment";
import { AccessControlFragment } from "@/lib/fragments/the-graph/access-control-fragment";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { Context } from "@/orpc/context/context";
import { mapUserRoles } from "@/orpc/helpers/role-validation";
import { baseRouter } from "@/orpc/procedures/base.router";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { isEthereumAddress } from "@atk/zod/ethereum-address";
import { satisfiesRoleRequirement } from "@atk/zod/role-requirement";
import { createLogger } from "@settlemint/sdk-utils/logging";
import z from "zod";

const logger = createLogger();

const READ_TOKEN_QUERY = theGraphGraphql(
  `
  query ReadTokenQuery($id: ID!) {
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
        identity {
          id
          claims {
            id
            name
            values {
              key
              value
            }
            revoked
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
        id
        schedule {
          id
        }
      }
      stats {
        totalValueInBaseCurrency
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
  const { auth, userIdentity, theGraphClient } = context;

  // Early authorization check before making expensive queries
  if (!auth?.user.wallet) {
    logger.warn("sessionMiddleware should be called before tokenMiddleware");
    throw errors.UNAUTHORIZED({
      message: "Authentication required to access token information",
    });
  }

  if (!userIdentity?.claims) {
    logger.warn(
      "userIdentityMiddleware should be called before tokenMiddleware"
    );
    throw errors.INTERNAL_SERVER_ERROR({
      message: "User identity context not set",
    });
  }

  if (!theGraphClient) {
    throw errors.INTERNAL_SERVER_ERROR({
      message: "theGraphMiddleware should be called before tokenMiddleware",
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
    },
    output: z.object({
      token: TokenSchema,
    }),
  });

  const token = result.token;

  const userRoles = mapUserRoles(auth.user.wallet, token.accessControl);

  const tokenContext = TokenSchema.parse({
    ...token,
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
            create: false,
            grantRole: false,
            revokeRole: false,
            mint: false,
            pause: false,
            addComplianceModule: false,
            approve: false,
            forcedRecover: false,
            freezeAddress: false,
            recoverERC20: false,
            recoverTokens: false,
            redeem: false,
            removeComplianceModule: false,
            setCap: false,
            setYieldSchedule: false,
            transfer: false,
            unpause: false,
            updateCollateral: false,
            withdrawDenominationAsset: false,
          };

        // Update based on user roles using the flexible role requirement system
        Object.entries(TOKEN_PERMISSIONS).forEach(
          ([action, roleRequirement]) => {
            const userRoleList = Object.entries(userRoles)
              .filter(([_, hasRole]) => hasRole)
              .map(([role]) => role) as AccessControlRoles[];

            initialActions[action as keyof typeof TOKEN_PERMISSIONS] =
              satisfiesRoleRequirement(userRoleList, roleRequirement);
          }
        );

        return initialActions;
      })(),
    },
  });

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
