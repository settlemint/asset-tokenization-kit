import { baseContract } from "@/orpc/procedures/base.contract";
import {
  StatsTransfersInputSchema,
  StatsTransfersOutputSchema,
} from "@/orpc/routes/token/routes/stats/transfers.schema";

export const statsTransfersContract = baseContract
  .route({
    method: "GET",
    path: "/token/stats/{tokenAddress}/transfers",
    description: "Get total transfers history statistics for a specific token",
    successDescription: "Token total transfers history statistics",
    tags: ["token", "stats", "asset", "transfers"],
  })
  .input(StatsTransfersInputSchema)
  .output(StatsTransfersOutputSchema);