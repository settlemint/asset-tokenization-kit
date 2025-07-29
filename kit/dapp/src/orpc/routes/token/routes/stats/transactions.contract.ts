import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TransactionsInputSchema,
  TransactionsOutputSchema,
} from "@/orpc/routes/token/routes/stats/transactions.schema";

export const transactionsContract = baseContract
  .route({
    method: "GET",
    path: "/stats/transactions",
    description: "Get system-wide transaction metrics and history",
    successDescription: "System transaction data",
    tags: ["token", "stats"],
  })
  .input(TransactionsInputSchema)
  .output(TransactionsOutputSchema);

export const assetTransactionsContract = baseContract
  .route({
    method: "GET",
    path: "/stats/{address}/transactions",
    description: "Get transaction history for a specific asset",
    successDescription: "Asset-specific transaction data",
    tags: ["token", "stats", "asset"],
  })
  .input(TransactionsInputSchema)
  .output(TransactionsOutputSchema);
