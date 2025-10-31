import { baseContract } from "@/orpc/procedures/base.contract";
import {
  StatsCollateralRatioInputSchema,
  StatsCollateralRatioOutputSchema,
} from "@/orpc/routes/token/routes/stats/collateral-ratio.schema";

export const statsCollateralRatioContract = baseContract
  .route({
    method: "GET",
    path: "/token/stats/{tokenAddress}/collateral-ratio",
    description:
      "Get collateral ratio statistics for stablecoins and tokenized deposits",
    successDescription: "Token collateral ratio statistics",
    tags: ["token"],
  })
  .input(StatsCollateralRatioInputSchema)
  .output(StatsCollateralRatioOutputSchema);
