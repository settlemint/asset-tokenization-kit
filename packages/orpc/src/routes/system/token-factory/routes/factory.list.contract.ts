import { baseContract } from "../../../../procedures/base.contract";
import {
  FactoryListSchema,
  TokenFactoryListSchema,
} from "./factory.list.schema";

export const factoryListContract = baseContract
  .route({
    method: "GET",
    path: "/system/token-factory",
    description: "List all token factories",
    successDescription: "List of token factories",
    tags: ["system", "token-factory"],
  })
  .input(TokenFactoryListSchema)
  .output(FactoryListSchema);
