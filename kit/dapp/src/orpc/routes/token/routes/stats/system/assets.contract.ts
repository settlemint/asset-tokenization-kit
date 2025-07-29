import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenStatsSystemAssetsInputSchema,
  TokenStatsSystemAssetsOutputSchema,
} from "@/orpc/routes/token/routes/stats/system/assets.schema";

export const tokenStatsSystemAssetsContract = baseContract
  .route({
    method: "GET",
    path: "/token/stats/system/assets",
    description: "Get system-wide asset count statistics",
    successDescription: "System asset count statistics",
    tags: ["token", "stats", "system"],
  })
  .input(TokenStatsSystemAssetsInputSchema)
  .output(TokenStatsSystemAssetsOutputSchema);
