import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { FactoryListSchema } from "@/orpc/routes/token/routes/factory.list.schema";
import { getPagination } from "@/orpc/routes/utils/pagination";
import type { VariablesOf } from "@settlemint/sdk-thegraph";
import { z } from "zod/v4";

const LIST_TOKEN_FACTORIES_QUERY = theGraphGraphql(`
  query ListTokenFactories($skip: Int!, $first: Int!, $orderBy: TokenFactory_orderBy = id, $orderDirection: OrderDirection = asc) {
    tokenFactories(
      skip: $skip
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      name
      typeId
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
    const { offset, limit } = getPagination(input);
    // orderBy is validated by the GraphQL schema, we just need to pass it through
    const orderBy = input?.orderBy ?? "id";
    const orderDirection = input?.orderDirection ?? "asc";

    const variables: VariablesOf<typeof LIST_TOKEN_FACTORIES_QUERY> = {
      skip: offset,
      first: limit,
      orderBy: orderBy as VariablesOf<
        typeof LIST_TOKEN_FACTORIES_QUERY
      >["orderBy"],
      orderDirection,
    };

    const response = await context.theGraphClient.query(
      LIST_TOKEN_FACTORIES_QUERY,
      variables,
      GraphQLResponseSchema,
      "Failed to list token factories"
    );

    return response.tokenFactories;
  });
