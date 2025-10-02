import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenListInputSchema,
  TokenListResponseSchema,
} from "@/orpc/routes/token/routes/token.list.schema";

export const tokenListContract = baseContract
  .route({
    method: "GET",
    path: "/token",
    description: "Get the list of tokens",
    successDescription: "List of tokens",
    tags: ["token"],
  })
  .input(TokenListInputSchema)
  .output(TokenListResponseSchema);
