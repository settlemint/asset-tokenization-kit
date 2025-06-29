import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { FactoryListSchema } from "@/orpc/routes/token/routes/factory.list.schema";

const LIST_TOKEN_FACTORIES_QUERY = theGraphGraphql(`
  query ListTokenFactories {
    tokenFactories {
      id
      name
      typeId
    }
  }
`);

export const factoryList = authRouter.token.factoryList
  .use(theGraphMiddleware)
  .handler(async ({ context }) => {
    return context.theGraphClient.query(
      LIST_TOKEN_FACTORIES_QUERY,
      {},
      FactoryListSchema,
      "Failed to list token factories"
    );
  });
