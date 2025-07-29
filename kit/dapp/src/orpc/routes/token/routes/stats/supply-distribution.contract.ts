import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenStatsSupplyDistributionInputSchema,
  TokenStatsSupplyDistributionOutputSchema,
} from "@/orpc/routes/token/routes/stats/supply-distribution.schema";

export const supplyDistributionContract = baseContract
  .route({
    method: "GET",
    path: "/stats/supply-distribution",
    description: "Get supply distribution for charts",
    successDescription: "Supply distribution data",
    tags: ["token", "stats"],
  })
  .input(TokenStatsSupplyDistributionInputSchema)
  .output(TokenStatsSupplyDistributionOutputSchema);
