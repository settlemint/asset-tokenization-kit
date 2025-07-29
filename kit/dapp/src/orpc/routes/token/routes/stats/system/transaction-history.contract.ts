import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenStatsSystemTransactionHistoryInputSchema,
  TokenStatsSystemTransactionHistoryOutputSchema,
} from "@/orpc/routes/token/routes/stats/system/transaction-history.schema";

export const tokenStatsSystemTransactionHistoryContract = baseContract
  .route({
    method: "GET",
    path: "/token/stats/system/transaction-history",
    description: "Get system-wide transaction history statistics",
    successDescription: "System transaction history statistics",
    tags: ["token", "stats", "system"],
  })
  .input(TokenStatsSystemTransactionHistoryInputSchema)
  .output(TokenStatsSystemTransactionHistoryOutputSchema);
