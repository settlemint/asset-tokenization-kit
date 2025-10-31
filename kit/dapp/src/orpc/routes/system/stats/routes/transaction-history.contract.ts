import { baseContract } from "@/orpc/procedures/base.contract";
import {
  StatsTransactionHistoryInputSchema,
  StatsTransactionHistoryOutputSchema,
} from "@/orpc/routes/system/stats/routes/transaction-history.schema";

export const statsTransactionHistoryContract = baseContract
  .route({
    method: "GET",
    path: "/system/stats/transaction-history",
    description: "Get system-wide transaction history statistics",
    successDescription: "System transaction history statistics",
    tags: ["system-stats"],
  })
  .input(StatsTransactionHistoryInputSchema)
  .output(StatsTransactionHistoryOutputSchema);
