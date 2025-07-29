import { baseContract } from "@/orpc/procedures/base.contract";
import {
  FactoryCreateOutputSchema,
  FactoryCreateSchema,
} from "@/orpc/routes/token/routes/factory/factory.create.schema";

export const factoryCreateContract = baseContract
  .route({
    method: "POST",
    path: "/token/factory",
    description:
      "Deploy one or more token factory contracts for creating specific token types (bond, equity, fund, stablecoin, deposit). Factories enable standardized token deployment",
    successDescription:
      "Token factory deployed successfully with streaming progress updates for batch deployments",
    tags: ["token"],
  })
  .input(FactoryCreateSchema)
  .output(FactoryCreateOutputSchema);
