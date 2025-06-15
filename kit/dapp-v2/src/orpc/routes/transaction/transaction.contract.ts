import { ac } from "@/orpc/procedures/auth.contract";
import {
  TransactionStatusInputSchema,
  TransactionStatusSchema,
} from "@/orpc/routes/transaction/routes/transaction.track.schema";
import { eventIterator } from "@orpc/contract";

const track = ac
  .route({
    method: "GET",
    path: "/transactions/track",
    description: "Track a transaction using server sent events",
    tags: ["transaction"],
  })
  .input(TransactionStatusInputSchema)
  .output(eventIterator(TransactionStatusSchema)); // Return array of system objects

export const transactionContract = {
  track,
};
