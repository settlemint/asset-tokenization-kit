import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenReadInputSchema,
  TokenSchema,
} from "@/orpc/routes/token/routes/token.read.schema";

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
