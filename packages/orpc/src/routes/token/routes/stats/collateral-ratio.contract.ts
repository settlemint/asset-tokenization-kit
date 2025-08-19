import { baseContract } from "../../../../procedures/base.contract";
import {
  StatsCollateralRatioInputSchema,
  StatsCollateralRatioOutputSchema,
} from "./collateral-ratio.schema";

export const statsCollateralRatioContract = baseContract
  .route({
    method: "GET",
    path: "/token/stats/{tokenAddress}/collateral-ratio",
    description:
      "Get collateral ratio statistics for stablecoins and tokenized deposits",
    successDescription: "Token collateral ratio statistics",
    tags: [
      "token",
      "stats",
      "asset",
      "collateral-ratio",
      "stablecoin",
      "deposit",
    ],
  })
  .input(StatsCollateralRatioInputSchema)
  .output(StatsCollateralRatioOutputSchema);
