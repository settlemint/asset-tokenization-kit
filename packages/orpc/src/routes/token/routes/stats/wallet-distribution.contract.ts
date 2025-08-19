import { baseContract } from "../../../../procedures/base.contract";
import {
  StatsWalletDistributionInputSchema,
  StatsWalletDistributionOutputSchema,
} from "./wallet-distribution.schema";

export const statsWalletDistributionContract = baseContract
  .route({
    method: "GET",
    path: "/token/stats/{tokenAddress}/wallet-distribution",
    description: "Get wallet distribution statistics for a specific token",
    successDescription: "Token wallet distribution statistics",
    tags: ["token", "stats", "asset", "wallet-distribution"],
  })
  .input(StatsWalletDistributionInputSchema)
  .output(StatsWalletDistributionOutputSchema);
