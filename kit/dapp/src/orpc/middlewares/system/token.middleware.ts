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
      identity {
        claims {
          name
          values {
            key
            value
          }
        }
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
  userHasRole: Record<TokenRoles, boolean>;
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
      return next({
        context: {
          token: {
            ...token,
            userRoles,
          },
        },
      });
    }
    return next();
  }
);
