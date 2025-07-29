import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenStatsSupplyDistributionInputSchema,
  TokenStatsSupplyDistributionOutputSchema,
} from "@/orpc/routes/token/routes/stats/supply-distribution.schema";

export const tokenStatsSupplyDistributionContract = baseContract
  .route({
    method: "GET",
    path: "/token/stats/supply-distribution",
    description: "Get supply distribution for charts",
    successDescription: "Supply distribution data",
    tags: ["token", "stats"],
  })
  .input(TokenStatsSupplyDistributionInputSchema)
  .output(TokenStatsSupplyDistributionOutputSchema);
