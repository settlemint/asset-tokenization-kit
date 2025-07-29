import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenStatsSystemTransactionCountInputSchema,
  TokenStatsSystemTransactionCountOutputSchema,
} from "@/orpc/routes/token/routes/stats/system/transaction-count.schema";

export const tokenStatsSystemTransactionCountContract = baseContract
  .route({
    method: "GET",
    path: "/token/stats/system/transaction-count",
    description: "Get system-wide transaction count statistics",
    successDescription: "System transaction count statistics",
    tags: ["token", "stats", "system"],
  })
  .input(TokenStatsSystemTransactionCountInputSchema)
  .output(TokenStatsSystemTransactionCountOutputSchema);
