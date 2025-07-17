import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenStatsTransactionHistoryInputSchema,
  TokenStatsTransactionHistoryOutputSchema,
} from "@/orpc/routes/token/routes/stats/transaction-history.schema";

export const tokenStatsTransactionHistoryContract = baseContract
  .route({
    method: "GET",
    path: "/token/stats/transaction-history",
    description: "Get transaction history over time",
    successDescription: "Transaction history data",
    tags: ["token", "stats"],
  })
  .input(TokenStatsTransactionHistoryInputSchema)
  .output(TokenStatsTransactionHistoryOutputSchema);
