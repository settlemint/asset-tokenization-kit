import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenStatsAssetCountInputSchema,
  TokenStatsAssetCountOutputSchema,
} from "@/orpc/routes/token/routes/stats/asset-count.schema";

export const tokenStatsAssetCountContract = baseContract
  .route({
    method: "GET",
    path: "/token/stats/asset-count",
    description: "Get asset count statistics",
    successDescription: "Asset count statistics",
    tags: ["token", "stats"],
  })
  .input(TokenStatsAssetCountInputSchema)
  .output(TokenStatsAssetCountOutputSchema);
