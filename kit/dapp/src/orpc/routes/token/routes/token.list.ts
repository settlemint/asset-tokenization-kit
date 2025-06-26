import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { TokenListSchema } from "@/orpc/routes/token/routes/token.list.schema";
import { getPagination } from "@/orpc/routes/utils/pagination";

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

export const list = authRouter.token.list
  .use(theGraphMiddleware)
  .handler(async ({ input, context }) => {
    const { offset, limit, orderDirection } = {
      ...getPagination(input),
      orderDirection: input?.orderDirection ?? "asc",
    };

    return context.theGraphClient.query(
      LIST_TOKEN_QUERY,
      {
        skip: offset,
        orderDirection,
        first: limit,
      },
      TokenListSchema,
      "Failed to list tokens"
    );
  });
