import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { TokenListSchema } from "@/orpc/routes/token/routes/token.list.schema";
import { toTheGraphVariables } from "@/orpc/routes/utils/thegraph-variables";

const LIST_TOKEN_QUERY = theGraphGraphql(`
  query ListTokenQuery($skip: Int!, $first: Int!, $orderBy: Token_orderBy, $orderDirection: OrderDirection) {
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
    const variables = toTheGraphVariables(input, LIST_TOKEN_QUERY);

    return context.theGraphClient.query(
      LIST_TOKEN_QUERY,
      variables,
      TokenListSchema,
      "Failed to list tokens"
    );
  });
