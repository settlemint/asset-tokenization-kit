import { baseContract } from "@/orpc/procedures/base.contract";
import { MutationOutputSchema as TokenTransactionOutputSchema } from "@/orpc/routes/common/schemas/mutation.schema";
import { TokenRemoveComplianceModuleInputSchema } from "@/orpc/routes/token/routes/mutations/compliance/token.remove-compliance-module.schema";
import { eventIterator } from "@orpc/server";

export const tokenRemoveComplianceModuleContract = baseContract
  .route({
    method: "DELETE",
    path: "/token/{contract}/remove-compliance-module",
    description: "Remove a compliance module from the token",
    successDescription: "Compliance module removed successfully",
    tags: ["token"],
  })
  .input(TokenRemoveComplianceModuleInputSchema)
  .output(eventIterator(TokenTransactionOutputSchema));
