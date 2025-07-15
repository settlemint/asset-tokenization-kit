import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenHoldersInputSchema,
  TokenHoldersResponseSchema,
} from "@/orpc/routes/token/routes/token.holders.schema";

export const tokenHoldersContract = baseContract
  .route({
    method: "GET",
    path: "/token/{tokenAddress}/holders",
    description: "Get token holders and their balances",
    successDescription: "List of token holders with balance information",
    tags: ["token"],
  })
  .input(TokenHoldersInputSchema)
  .output(TokenHoldersResponseSchema);
