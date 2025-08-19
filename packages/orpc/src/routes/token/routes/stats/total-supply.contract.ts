import { baseContract } from "../../../../procedures/base.contract";
import {
  StatsTotalSupplyInputSchema,
  StatsTotalSupplyOutputSchema,
} from "./total-supply.schema";

export const statsTotalSupplyContract = baseContract
  .route({
    method: "GET",
    path: "/token/stats/{tokenAddress}/total-supply",
    description: "Get total supply history statistics for a specific token",
    successDescription: "Token total supply history statistics",
    tags: ["token", "stats", "asset", "total-supply"],
  })
  .input(StatsTotalSupplyInputSchema)
  .output(StatsTotalSupplyOutputSchema);
