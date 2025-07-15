import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenStatsTransactionCountInputSchema,
  TokenStatsTransactionCountOutputSchema,
} from "@/orpc/routes/token/routes/stats/transaction-count.schema";

export const tokenStatsTransactionCountContract = baseContract
  .route({
    method: "GET",
    path: "/token/stats/transaction-count",
    description: "Get transaction count statistics",
    successDescription: "Transaction count statistics",
    tags: ["token", "stats"],
  })
  .input(TokenStatsTransactionCountInputSchema)
  .output(TokenStatsTransactionCountOutputSchema);
