import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenStatsTransactionsInputSchema,
  TokenStatsTransactionsOutputSchema,
} from "@/orpc/routes/token/routes/stats/transactions.schema";

export const tokenStatsTransactionsContract = baseContract
  .route({
    method: "GET",
    path: "/token/stats/transactions",
    description: "Get token transaction statistics",
    successDescription: "Transaction statistics",
    tags: ["token", "stats"],
  })
  .input(TokenStatsTransactionsInputSchema)
  .output(TokenStatsTransactionsOutputSchema);
