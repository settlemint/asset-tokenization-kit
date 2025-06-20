import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";

const LIST_TOKEN_QUERY = theGraphGraphql(`
  query ListTokenQuery($skip: Int!, $orderDirection: OrderDirection = asc, $first: Int = 20) {
    tokens(
        first: $first
        orderDirection: $orderDirection
        skip: $skip
      ) {
        id
        name
        symbol
        decimals
      }
    }
  `);

export const list = authRouter.system.list
  .use(theGraphMiddleware)
  .handler(async ({ input, context }) => {
    const { offset, limit, orderDirection } = input ?? {
      offset: 0,
      limit: 20,
      orderDirection: "asc",
    };

    const { tokens } = await context.theGraphClient.request(LIST_TOKEN_QUERY, {
      skip: offset,
      orderDirection,
      first: limit,
    });

    return tokens;
  });
