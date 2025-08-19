import { baseContract } from "../../../procedures/base.contract";
import { TokenReadInputSchema, TokenSchema } from "./token.read.schema";

export const tokenReadContract = baseContract
  .route({
    method: "GET",
    path: "/token/{tokenAddress}",
    description: "Get a token by address",
    successDescription: "Token",
    tags: ["token"],
  })
  .input(TokenReadInputSchema)
  .output(TokenSchema);
