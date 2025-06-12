import { ethereumHash } from "@/lib/utils/zod/validators/ethereum-hash";
import { z } from "zod";

export const TransactionStatusSchema = z.discriminatedUnion("status", [
  z.object({
    transactionHash: z.union([ethereumHash, z.array(ethereumHash)]),
    status: z.literal("pending"),
    message: z.string(),
  }),
  z.object({
    transactionHash: z.union([ethereumHash, z.array(ethereumHash)]),
    status: z.literal("confirmed"),
    message: z.string(),
  }),
  z.object({
    transactionHash: z.union([ethereumHash, z.array(ethereumHash)]),
    status: z.literal("failed"),
    reason: z.string(),
  }),
]);

export const TransactionStatusInputSchema = z.object({
  transactionHash: z.union([ethereumHash, z.array(ethereumHash)]),
});
