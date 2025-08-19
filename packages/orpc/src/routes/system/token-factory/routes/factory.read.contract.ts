import { baseContract } from "../../../../procedures/base.contract";
import {
  FactoryReadSchema,
  TokenFactoryDetailSchema,
} from "./factory.read.schema";

export const factoryReadContract = baseContract
  .route({
    method: "GET",
    path: "/system/token-factory/{id}",
    description: "Get a token factory by ID",
    successDescription: "Token factory details",
    tags: ["system", "token-factory"],
  })
  .input(FactoryReadSchema)
  .output(TokenFactoryDetailSchema);
