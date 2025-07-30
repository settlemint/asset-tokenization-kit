import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenRemoveComplianceModuleInputSchema } from "@/orpc/routes/token/routes/mutations/compliance/token.remove-compliance-module.schema";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";

export const tokenRemoveComplianceModuleContract = baseContract
  .route({
    method: "DELETE",
    path: "/token/{contract}/remove-compliance-module",
    description: "Remove a compliance module from the token",
    successDescription: "Compliance module removed successfully",
    tags: ["token"],
  })
  .input(TokenRemoveComplianceModuleInputSchema)
  .output(TokenSchema);
