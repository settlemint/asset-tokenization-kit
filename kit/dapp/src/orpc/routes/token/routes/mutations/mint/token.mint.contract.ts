import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenMintInputSchema } from "@/orpc/routes/token/routes/mutations/mint/token.mint.schema";
import { TokenTransactionOutputSchema } from "@/orpc/routes/token/routes/mutations/common/token.transaction.schema";
import { eventIterator } from "@orpc/server";

export const tokenMintContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/mint",
    description: "Mint new tokens to one or more addresses",
    successDescription: "Tokens minted successfully",
    tags: ["token"],
  })
  .input(TokenMintInputSchema)
  .output(eventIterator(TokenTransactionOutputSchema));
