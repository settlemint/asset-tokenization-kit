import { baseContract } from "@/orpc/procedures/base.contract";
import {
  StatsTransactionCountInputSchema,
  StatsTransactionCountOutputSchema,
} from "@/orpc/routes/system/stats/routes/transaction-count.schema";

export const statsTransactionCountContract = baseContract
  .route({
    method: "GET",
    path: "/system/stats/transaction-count",
    description: "Get system-wide transaction count statistics",
    successDescription: "System transaction count statistics",
    tags: ["system-stats"],
  })
  .input(StatsTransactionCountInputSchema)
  .output(StatsTransactionCountOutputSchema);
