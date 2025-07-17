import {
  AccessControlFragment,
  type AccessControlRoles,
} from "@/lib/fragments/the-graph/access-control-fragment";
import { theGraphClient, theGraphGraphql } from "@/lib/settlemint/the-graph";
import { isEthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { baseRouter } from "@/orpc/procedures/base.router";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import type { ResultOf } from "@settlemint/sdk-thegraph";
import { createLogger } from "@settlemint/sdk-utils/logging";

const logger = createLogger();

const READ_TOKEN_QUERY = theGraphGraphql(
  `
  query ReadTokenQuery($id: ID!) {
    token(id: $id) {
      id
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
      requiredClaimTopics {
        name
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

export type TokenExtensions = NonNullable<
  NonNullable<ResultOf<typeof READ_TOKEN_QUERY>["token"]>["extensions"][0]
>;

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

    const tokenAddress =
      typeof input === "object" && input !== null && "tokenAddress" in input
        ? input.tokenAddress
        : null;

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

    const userRoles = Object.entries(token.accessControl ?? {}).reduce<
      Record<AccessControlRoles, boolean>
    >(
      (acc, [role, accounts]) => {
        const userHasRole = accounts.some(
          (account) => account.id === auth.user.wallet
        );
        acc[role as AccessControlRoles] = userHasRole;
        return acc;
      },
      {} as Record<AccessControlRoles, boolean>
    );

    const tokenContext = TokenSchema.parse({
      ...token,
      requiredClaimTopics: token.requiredClaimTopics.map(({ name }) => name),
      userPermissions: {
        roles: userRoles,
        isCompliant: token.requiredClaimTopics.every(({ name }) =>
          userClaimTopics.includes(name)
        ),
        // TODO: implement logic which checks if the user is allowed to interact with the token
        // user is not allowed when in the block list or when it requires an allow list
        // Another reason could be that the user is a citizen of a blocked country
        // We should do this in the subgraph, more fine grained so we can derive the reason here
        isAllowed: true,
        notAllowedReason: undefined,
        actions: Object.entries(TOKEN_PERMISSIONS).reduce<
          Record<keyof typeof TOKEN_PERMISSIONS, boolean>
        >(
          (acc, [action, requiredRoles]) => {
            acc[action as keyof typeof TOKEN_PERMISSIONS] = requiredRoles.every(
              (role) => userRoles[role]
            );
            return acc;
          },
          {} as Record<keyof typeof TOKEN_PERMISSIONS, boolean>
        ),
      },
    });

    return next({
      context: {
        token: tokenContext,
      },
    });
  }
);
