import { baseContract } from "@/procedures/base.contract";
import {
  StatsTransactionHistoryInputSchema,
  StatsTransactionHistoryOutputSchema,
} from "@/routes/system/stats/routes/transaction-history.schema";

export const statsTransactionHistoryContract = baseContract
  .route({
    method: "GET",
    path: "/system/stats/transaction-history",
    description: "Get system-wide transaction history statistics",
    successDescription: "System transaction history statistics",
    tags: ["stats", "system"],
  })
  .input(StatsTransactionHistoryInputSchema)
  .output(StatsTransactionHistoryOutputSchema);
