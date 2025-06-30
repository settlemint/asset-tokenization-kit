import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { TokenFactoryDetailSchema } from "./factory.read.schema";

const READ_TOKEN_FACTORY_QUERY = theGraphGraphql(`
  query ReadTokenFactory($id: ID!) {
    tokenFactory(id: $id) {
      id
      name
      typeId
    }
  }
`);

export const factoryRead = authRouter.token.factoryRead
  .use(theGraphMiddleware)
  .handler(async ({ input, context }) => {
    return context.theGraphClient.query(
      READ_TOKEN_FACTORY_QUERY,
      input,
      TokenFactoryDetailSchema,
      "Failed to read token factory",
      {
        transform: (input) => ({
          id: input.id.toLowerCase(), // The Graph uses lowercase addresses
        }),
      }
    );
  });
