import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenAddComplianceModuleInputSchema } from "@/orpc/routes/token/routes/mutations/compliance/token.add-compliance-module.schema";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";

export const tokenAddComplianceModuleContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/add-compliance-module",
    description: "Add a compliance module to the token",
    successDescription: "Compliance module added successfully",
    tags: ["token"],
  })
  .input(TokenAddComplianceModuleInputSchema)
  .output(TokenSchema);
