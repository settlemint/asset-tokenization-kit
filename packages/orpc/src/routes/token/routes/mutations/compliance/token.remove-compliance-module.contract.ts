import { baseContract } from "../../../../../procedures/base.contract";
import { TokenRemoveComplianceModuleInputSchema } from "./token.remove-compliance-module.schema";
import { TokenSchema } from "../../token.read.schema";

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
