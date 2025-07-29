import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenStatsAssetsOutputSchema } from "@/orpc/routes/token/routes/stats/assets.schema";

export const assetsContract = baseContract
  .route({
    method: "GET",
    path: "/stats/assets",
    description: "Get token asset statistics",
    successDescription: "Asset statistics",
    tags: ["token", "stats"],
  })
  .output(TokenStatsAssetsOutputSchema);
