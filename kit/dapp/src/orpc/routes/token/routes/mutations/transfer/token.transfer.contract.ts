import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenTransferSchema } from "@/orpc/routes/token/routes/mutations/transfer/token.transfer.schema";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";

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
  .output(TokenSchema);
