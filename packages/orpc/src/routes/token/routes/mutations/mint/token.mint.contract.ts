import { baseContract } from "@/procedures/base.contract";
import { TokenSchema } from "@/routes/token/routes/token.read.schema";
import { TokenMintInputSchema } from "./token.mint.schema";

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
