import { baseContract } from "@/orpc/procedures/base.contract";
import {
  FactoryListSchema,
  TokenFactoryListSchema,
} from "@/orpc/routes/system/token-factory/routes/factory.list.schema";

export const factoryListContract = baseContract
  .route({
    method: "GET",
    path: "/system/token-factory",
    description: "List all token factories",
    successDescription: "List of token factories",
    tags: ["token-factory"],
  })
  .input(TokenFactoryListSchema)
  .output(FactoryListSchema);
