import { baseContract } from "@/orpc/procedures/base.contract";
import {
  StatsBondYieldCoverageInputSchema,
  StatsBondYieldCoverageOutputSchema,
} from "./bond-yield-coverage.schema";

export const statsBondYieldCoverageContract = baseContract
  .route({
    method: "GET",
    path: "/token/{tokenAddress}/stats/bond-yield-coverage",
    description: "Get bond yield coverage statistics for a specific token",
    successDescription:
      "Bond yield coverage statistics including yield schedule information",
    tags: ["token", "stats", "bond", "yield"],
  })
  .input(StatsBondYieldCoverageInputSchema)
  .output(StatsBondYieldCoverageOutputSchema);
