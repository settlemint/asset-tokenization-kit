import { baseContract } from "@/orpc/procedures/base.contract";
import { MutationOutputSchema as TokenTransactionOutputSchema } from "@/orpc/routes/common/schemas/mutation.schema";
import { TokenMintInputSchema } from "@/orpc/routes/token/routes/mutations/mint/token.mint.schema";
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
