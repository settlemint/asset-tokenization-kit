import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenTransferSchema } from "@/orpc/routes/token/routes/mutations/transfer/token.transfer.schema";
import { TokenTransactionOutputSchema } from "@/orpc/routes/token/routes/mutations/common/token.transaction.schema";
import { eventIterator } from "@orpc/server";

export const tokenTransferContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/transfer",
    description:
      "Transfer tokens (standard, transferFrom, or forced) to one or more addresses",
    successDescription: "Tokens transferred successfully",
    tags: ["token"],
  })
  .input(TokenTransferSchema)
  .output(eventIterator(TokenTransactionOutputSchema));
