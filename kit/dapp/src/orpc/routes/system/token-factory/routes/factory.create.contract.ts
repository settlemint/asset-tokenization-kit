import { baseContract } from "@/orpc/procedures/base.contract";
import { SystemSchema } from "@/orpc/routes/system/routes/system.read.schema";
import { FactoryCreateSchema } from "@/orpc/routes/system/token-factory/routes/factory.create.schema";

export const factoryCreateContract = baseContract
  .route({
    method: "POST",
    path: "/system/token-factory",
    description:
      "Deploy one or more token factory contracts for creating specific token types (bond, equity, fund, stablecoin, deposit). Factories enable standardized token deployment",
    successDescription:
      "Token factory deployed successfully with streaming progress updates for batch deployments",
    tags: ["token-factory"],
  })
  .input(FactoryCreateSchema)
  .output(SystemSchema);
