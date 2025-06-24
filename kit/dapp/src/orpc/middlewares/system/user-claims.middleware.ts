import { AccessControlFragment } from "@/lib/fragments/the-graph/access-control-fragment";
import { theGraphClient, theGraphGraphql } from "@/lib/settlemint/the-graph";
import { baseRouter } from "@/orpc/procedures/base.router";

const READ_ACCOUNT_QUERY = theGraphGraphql(
  `
  query ReadAccountQuery($id: ID!) {
    account(id: $id) {
      id
      identity {
        claims {
          name
        }
      }
    }
  }
  `,
  [AccessControlFragment]
);

/**
 * Middleware to inject the user claims into the request context.
 * @returns The middleware function.
 */
export const userClaimsMiddleware = baseRouter.middleware(
  async ({ next, context }) => {
    if (!context.auth?.user.wallet) {
      return next();
    }

    const { account } = await theGraphClient.request(READ_ACCOUNT_QUERY, {
      id: context.auth.user.wallet,
    });

    const userClaimTopics =
      account?.identity?.claims.map((claim) => claim.name) ?? [];

    return next({
      context: {
        userClaimTopics,
      },
    });
  }
);
