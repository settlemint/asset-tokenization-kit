import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { FactoryListSchema } from "@/orpc/routes/token/routes/factory.list.schema";
import { z } from "zod/v4";

const LIST_TOKEN_FACTORIES_QUERY = theGraphGraphql(`
  query ListTokenFactories($skip: Int!, $first: Int!, $orderBy: TokenFactory_orderBy, $orderDirection: OrderDirection, $where: TokenFactory_filter) {
    tokenFactories(
      skip: $skip
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      id
      name
      typeId
      hasTokens
    }
  }
`);

// Schema for the GraphQL response wrapper
const GraphQLResponseSchema = z.object({
  tokenFactories: FactoryListSchema,
});

export const factoryList = authRouter.token.factoryList
  .use(theGraphMiddleware)
  .handler(async ({ input, context }) => {
    const response = await context.theGraphClient.query(
      LIST_TOKEN_FACTORIES_QUERY,
      {
        input: {
          input,
          filter: { hasTokens: input.hasTokens },
        },
        output: GraphQLResponseSchema,
        error: "Failed to list token factories",
      }
    );

    return response.tokenFactories;
  });
