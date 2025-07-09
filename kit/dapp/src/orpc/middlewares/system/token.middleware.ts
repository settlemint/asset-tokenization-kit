import { AccessControlFragment } from "@/lib/fragments/the-graph/access-control-fragment";
import { theGraphClient, theGraphGraphql } from "@/lib/settlemint/the-graph";
import { isEthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { baseRouter } from "@/orpc/procedures/base.router";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";
import type { ResultOf } from "@settlemint/sdk-thegraph";

const READ_TOKEN_QUERY = theGraphGraphql(
  `
  query ReadTokenQuery($id: ID!) {
    token(id: $id) {
      id
      name
      symbol
      decimals
      totalSupply
      pausable {
        paused
      }
      requiredClaimTopics {
        name
      }
      accessControl {
        ...AccessControlFragment
      }
    }
  }
  `,
  [AccessControlFragment]
);

export type TokenRoles = keyof NonNullable<
  NonNullable<ResultOf<typeof READ_TOKEN_QUERY>["token"]>["accessControl"]
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

    const { auth, userClaimTopics } = context;

    // Early authorization check before making expensive queries
    if (!auth?.user.wallet) {
      throw errors.UNAUTHORIZED({
        message: "Authentication required to access token information",
      });
    }

    if (!userClaimTopics) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "User claim topics context not set",
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
      Record<TokenRoles, boolean>
    >(
      (acc, [role, accounts]) => {
        const userHasRole = accounts.some(
          (account) => account.id === auth.user.wallet
        );
        acc[role as TokenRoles] = userHasRole;
        return acc;
      },
      {} as Record<TokenRoles, boolean>
    );

    const tokenContext = TokenSchema.parse({
      ...token,
      userPermissions: {
        roles: userRoles,
        isCompliant: token.requiredClaimTopics.every(({ name }) =>
          userClaimTopics.includes(name)
        ),
        isAllowed: true,
      },
    });

    return next({
      context: {
        token: tokenContext,
      },
    });
  }
);
