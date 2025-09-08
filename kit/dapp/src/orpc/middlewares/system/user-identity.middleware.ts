import { AccessControlFragment } from "@/lib/fragments/the-graph/access-control-fragment";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { baseRouter } from "@/orpc/procedures/base.router";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import z from "zod";

const READ_ACCOUNT_QUERY = theGraphGraphql(
  `
  query ReadAccountQuery($id: ID!) {
    account(id: $id) {
      id
      identity {
        id
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
 * Middleware to inject the user identity and claims into the request context.
 * @returns The middleware function.
 */
export const userIdentityMiddleware = baseRouter.middleware(
  async ({ next, context, errors }) => {
    if (!context.auth) {
      return next();
    }
    const { theGraphClient } = context;

    if (!theGraphClient) {
      throw errors.INTERNAL_SERVER_ERROR({
        message:
          "theGraphMiddleware should be called before userClaimsMiddleware",
      });
    }

    const { account } = await theGraphClient.query(READ_ACCOUNT_QUERY, {
      input: { id: context.auth.user.wallet },
      output: z.object({
        account: z.object({
          identity: z.object({
            id: ethereumAddress,
            claims: z.array(z.object({ name: z.string() })),
          }),
        }),
      }),
    });

    const userClaimTopics =
      account?.identity?.claims.map((claim) => claim.name) ?? [];

    return next({
      context: {
        userIdentity: {
          address: account?.identity?.id,
          claims: userClaimTopics,
        },
      },
    });
  }
);
