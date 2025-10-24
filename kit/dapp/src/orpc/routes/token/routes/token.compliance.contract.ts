import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenComplianceInputSchema,
  TokenComplianceResponseSchema,
} from "@/orpc/routes/token/routes/token.compliance.schema";

export const tokenComplianceContract = baseContract
  .route({
    method: "GET",
    path: "/token/{tokenAddress}/compliance",
    description: "Get token compliance modules",
    successDescription: "Token compliance modules",
    tags: ["token"],
  })
  .input(TokenComplianceInputSchema)
  .output(TokenComplianceResponseSchema);
