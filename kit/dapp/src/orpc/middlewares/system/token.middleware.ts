import { AccessControlFragment } from "@/lib/fragments/the-graph/access-control-fragment";
import { theGraphClient, theGraphGraphql } from "@/lib/settlemint/the-graph";
import { isEthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { mapUserRoles } from "@/orpc/helpers/role-validation";
import { baseRouter } from "@/orpc/procedures/base.router";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { createLogger } from "@settlemint/sdk-utils/logging";

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
    }
  }
  `,
  [AccessControlFragment]
);

/**
 * Middleware to inject the token context into the request context.
 * @returns The middleware function.
 */
export const tokenMiddleware = baseRouter.middleware(
  async ({ next, context, errors }, input) => {
    if (context.token) {
      return next({
        context: {
          token: context.token,
        },
      });
    }

    const { auth, userClaimTopics } = context;

    // Early authorization check before making expensive queries
    if (!auth?.user.wallet) {
      logger.warn("sessionMiddleware should be called before tokenMiddleware");
      throw errors.UNAUTHORIZED({
        message: "Authentication required to access token information",
      });
    }

    if (!userClaimTopics) {
      logger.warn(
        "userClaimsMiddleware should be called before tokenMiddleware"
      );
      throw errors.INTERNAL_SERVER_ERROR({
        message: "User claim topics context not set",
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

    const { token } = await theGraphClient.request(READ_TOKEN_QUERY, {
      id: tokenAddress,
    });

    if (!token) {
      throw errors.NOT_FOUND({
        message: "Token not found",
      });
    }

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
          const initialActions: Record<
            keyof typeof TOKEN_PERMISSIONS,
            boolean
          > = {
            burn: false,
            create: false,
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
          };

          // Update based on user roles
          Object.entries(TOKEN_PERMISSIONS).forEach(
            ([action, requiredRoles]) => {
              initialActions[action as keyof typeof TOKEN_PERMISSIONS] =
                requiredRoles.every((role) => userRoles[role]);
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
  }
);

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
