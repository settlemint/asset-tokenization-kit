import { baseContract } from "@/orpc/procedures/base.contract";
import {
  FactoryListSchema,
  TokenFactoryListSchema,
} from "@/orpc/routes/token/routes/factory/factory.list.schema";

export const factoryListContract = baseContract
  .route({
    method: "GET",
    path: "/token/factory",
    description: "List all token factories",
    successDescription: "List of token factories",
    tags: ["token"],
  })
  .input(TokenFactoryListSchema)
  .output(FactoryListSchema);
