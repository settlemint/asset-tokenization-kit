import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { TokenListSchema } from "@/orpc/routes/token/routes/token.list.schema";
import { getPagination } from "@/orpc/routes/utils/pagination";
import type { VariablesOf } from "@settlemint/sdk-thegraph";

const LIST_TOKEN_QUERY = theGraphGraphql(`
  query ListTokenQuery($skip: Int!, $first: Int!, $orderBy: Token_orderBy = id, $orderDirection: OrderDirection = asc) {
    tokens(
        skip: $skip
        first: $first
        orderBy: $orderBy
        orderDirection: $orderDirection
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
    const { offset, limit } = getPagination(input);
    const orderBy = input?.orderBy ?? "id";
    const orderDirection = input?.orderDirection ?? "asc";

    const variables: VariablesOf<typeof LIST_TOKEN_QUERY> = {
      skip: offset,
      first: limit,
      orderBy: orderBy as VariablesOf<typeof LIST_TOKEN_QUERY>['orderBy'],
      orderDirection,
    };

    return context.theGraphClient.query(
      LIST_TOKEN_QUERY,
      variables,
      TokenListSchema,
      "Failed to list tokens"
    );
  });
