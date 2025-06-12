import { ethereumHash } from "@/lib/utils/zod/validators/ethereum-hash";
import { z } from "zod";

export const TransactionStatusSchema = z.discriminatedUnion("status", [
  z.object({
    transactionHash: ethereumHash,
    status: z.literal("pending"),
    message: z.string(),
  }),
  z.object({
    transactionHash: ethereumHash,
    status: z.literal("confirmed"),
    message: z.string(),
  }),
  z.object({
    transactionHash: ethereumHash,
    status: z.literal("failed"),
    reason: z.string(),
  }),
]);

export const TransactionStatusInputSchema = z.object({
  transactionHash: ethereumHash,
  messages: z.object({
    transaction: z.object({
      pending: z.string().default("Transaction is sent to the network"),
      success: z.string().default("Transaction is included in a block"),
      dropped: z.string().default("Transaction is dropped from the mempool"),
    }),
    indexing: z.object({
      pending: z.string().default("Transaction is pending"),
      success: z.string().default("Transaction is confirmed"),
      dropped: z.string().default("Transaction is dropped"),
    }),
  }),
});
