import { baseContract } from "@/orpc/procedures/base.contract";
import {
  FactoryReadSchema,
  TokenFactoryDetailSchema,
} from "@/orpc/routes/token/routes/factory/factory.read.schema";

export const factoryReadContract = baseContract
  .route({
    method: "GET",
    path: "/token/factory/{id}",
    description: "Get a token factory by ID",
    successDescription: "Token factory details",
    tags: ["token"],
  })
  .input(FactoryReadSchema)
  .output(TokenFactoryDetailSchema);
