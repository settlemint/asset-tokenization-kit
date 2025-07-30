import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenStatsAssetSupplyChangesInputSchema,
  TokenStatsAssetSupplyChangesOutputSchema,
} from "@/orpc/routes/token/routes/stats/[tokenAddress]/supply-changes.schema";

export const tokenStatsAssetSupplyChangesContract = baseContract
  .route({
    method: "GET",
    path: "/token/stats/{tokenAddress}/supply-changes",
    description:
      "Get supply changes history (minted/burned) statistics for a specific token",
    successDescription: "Token supply changes history statistics",
    tags: ["token", "stats", "asset", "supply-changes"],
  })
  .input(TokenStatsAssetSupplyChangesInputSchema)
  .output(TokenStatsAssetSupplyChangesOutputSchema);
