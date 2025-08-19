import { baseContract } from "@/procedures/base.contract";
import { TokenListInputSchema, TokenListSchema } from "./token.list.schema";

export const tokenListContract = baseContract
  .route({
    method: "GET",
    path: "/token",
    description: "Get the list of tokens",
    successDescription: "List of tokens",
    tags: ["token"],
  })
  .input(TokenListInputSchema)
  .output(TokenListSchema);
