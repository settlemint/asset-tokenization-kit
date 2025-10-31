import { baseContract } from "@/orpc/procedures/base.contract";
import {
  StatsYieldCoverageInputSchema,
  StatsYieldCoverageOutputSchema,
} from "@/orpc/routes/token/routes/stats/yield-coverage.schema";

export const statsYieldCoverageContract = baseContract
  .route({
    method: "GET",
    path: "/token/{tokenAddress}/stats/yield-coverage",
    description: "Get bond yield coverage statistics for a specific token",
    successDescription:
      "Yield coverage data showing underlying asset protection of yields",
    tags: ["token"],
  })
  .input(StatsYieldCoverageInputSchema)
  .output(StatsYieldCoverageOutputSchema);
