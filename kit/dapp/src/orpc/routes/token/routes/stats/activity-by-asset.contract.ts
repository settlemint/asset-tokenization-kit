import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenStatsActivityByAssetInputSchema,
  TokenStatsActivityByAssetOutputSchema,
} from "@/orpc/routes/token/routes/stats/activity-by-asset.schema";

export const tokenStatsActivityByAssetContract = baseContract
  .route({
    method: "GET",
    path: "/token/stats/activity-by-asset",
    description: "Get activity breakdown by asset type",
    successDescription: "Activity by asset data",
    tags: ["token", "stats"],
  })
  .input(TokenStatsActivityByAssetInputSchema)
  .output(TokenStatsActivityByAssetOutputSchema);
