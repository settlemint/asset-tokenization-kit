import { baseContract } from "@/orpc/procedures/base.contract";
import {
  FactoryReadSchema,
  TokenFactoryDetailSchema,
} from "@/orpc/routes/system/token-factory/routes/factory.read.schema";

export const factoryReadContract = baseContract
  .route({
    method: "GET",
    path: "/system/token-factory/{id}",
    description: "Get a token factory by ID",
    successDescription: "Token factory details",
    tags: ["token-factory"],
  })
  .input(FactoryReadSchema)
  .output(TokenFactoryDetailSchema);
