import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenStatsAssetTotalSupplyInputSchema,
  TokenStatsAssetTotalSupplyOutputSchema,
} from "@/orpc/routes/token/routes/stats/[tokenAddress]/total-supply.schema";

export const tokenStatsAssetTotalSupplyContract = baseContract
  .route({
    method: "GET",
    path: "/token/stats/{tokenAddress}/total-supply",
    description: "Get total supply history statistics for a specific token",
    successDescription: "Token total supply history statistics",
    tags: ["token", "stats", "asset", "total-supply"],
  })
  .input(TokenStatsAssetTotalSupplyInputSchema)
  .output(TokenStatsAssetTotalSupplyOutputSchema);
