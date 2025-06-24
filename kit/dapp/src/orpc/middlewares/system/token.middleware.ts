import { AccessControlFragment } from "@/lib/fragments/the-graph/access-control-fragment";
import { theGraphClient, theGraphGraphql } from "@/lib/settlemint/the-graph";
import { baseRouter } from "@/orpc/procedures/base.router";
import type { ResultOf } from "@settlemint/sdk-thegraph";

const READ_TOKEN_QUERY = theGraphGraphql(
  `
  query ReadTokenQuery($id: ID!) {
    token(id: $id) {
      id
      name
      symbol
      decimals
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

export type Token = Omit<
  ResultOf<typeof READ_TOKEN_QUERY>["token"],
  "accessControl"
> & {
  userPermissions: {
    // List of roles, when true the user has the role
    roles: Record<TokenRoles, boolean>;
    // User has the required claim topics to interact with the token
    isCompliant: boolean;
    // User is allowed to interact with the token
    isAllowed: boolean;
  };
};

/**
 * Middleware to inject the token context into the request context.
 * @returns The middleware function.
 */
export const tokenMiddleware = baseRouter.middleware(
  async ({ next, context, errors }, input) => {
    const id =
      typeof input === "object" && input !== null && "id" in input
        ? input.id
        : null;
    if (typeof id !== "string") {
      return next();
    }

    const { auth, userClaimTopics } = context;
    if (!userClaimTopics) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "User claim context not set",
      });
    }

    const { token } = await theGraphClient.request(READ_TOKEN_QUERY, {
      id: id,
    });
    const userRoles = Object.entries(token?.accessControl ?? {}).reduce(
      (acc, [role, accounts]) => {
        const userHasRole = accounts.some(
          (account) => account.id === auth?.user.wallet
        );
        acc[role as TokenRoles] = userHasRole;
        return acc;
      },
      {} as Record<TokenRoles, boolean>
    );

    const tokenContext: Token = {
      ...token,
      userPermissions: {
        roles: userRoles,
        isCompliant:
          token?.requiredClaimTopics.every(({ name }) =>
            userClaimTopics.includes(name)
          ) ?? true,
        isAllowed: true,
      },
    };

    return next({
      context: {
        token: tokenContext,
      },
    });
  }
);
