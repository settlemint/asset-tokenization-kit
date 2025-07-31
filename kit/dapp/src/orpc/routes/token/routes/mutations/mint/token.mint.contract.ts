import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenMintInputSchema } from "@/orpc/routes/token/routes/mutations/mint/token.mint.schema";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";

export const tokenMintContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/mint",
    description: "Mint new tokens to one or more addresses",
    successDescription: "Tokens minted successfully",
    tags: ["token"],
  })
  .input(TokenMintInputSchema)
  .output(TokenSchema);
