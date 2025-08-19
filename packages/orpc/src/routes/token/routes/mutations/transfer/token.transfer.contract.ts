import { baseContract } from "@/procedures/base.contract";
import { TokenSchema } from "@/routes/token/routes/token.read.schema";
import { TokenTransferSchema } from "./token.transfer.schema";

export const tokenTransferContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/transfer",
    description: "Transfer tokens (standard, transferFrom, or forced) to one or more addresses",
    successDescription: "Tokens transferred successfully",
    tags: ["token"],
  })
  .input(TokenTransferSchema)
  .output(TokenSchema);
