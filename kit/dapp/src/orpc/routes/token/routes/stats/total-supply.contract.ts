import { baseContract } from "@/orpc/procedures/base.contract";
import {
  StatsTotalSupplyInputSchema,
  StatsTotalSupplyOutputSchema,
} from "@/orpc/routes/token/routes/stats/total-supply.schema";

export const statsTotalSupplyContract = baseContract
  .route({
    method: "GET",
    path: "/token/stats/{tokenAddress}/total-supply",
    description: "Get total supply history statistics for a specific token",
    successDescription: "Token total supply history statistics",
    tags: ["token"],
  })
  .input(StatsTotalSupplyInputSchema)
  .output(StatsTotalSupplyOutputSchema);
