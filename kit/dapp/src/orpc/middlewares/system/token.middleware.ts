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
  };
};

/**
 * Middleware to inject the token context into the request context.
 * @returns The middleware function.
 */
export const tokenMiddleware = baseRouter.middleware(
  async ({ next, context }, input) => {
    if (
      typeof input === "object" &&
      input !== null &&
      "id" in input &&
      typeof input.id === "string"
    ) {
      const { token } = await theGraphClient.request(READ_TOKEN_QUERY, {
        id: input.id,
      });
      const userRoles = Object.entries(token?.accessControl ?? {}).reduce(
        (acc, [role, accounts]) => {
          const userHasRole = accounts.some(
            (account) => account.id === context.auth?.user.wallet
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
          isCompliant: token?.requiredClaimTopics.length === 0,
        },
      };

      return next({
        context: {
          token: tokenContext,
        },
      });
    }
    return next();
  }
);
