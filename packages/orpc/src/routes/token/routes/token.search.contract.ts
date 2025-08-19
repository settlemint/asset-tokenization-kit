import { baseContract } from "@/procedures/base.contract";
import { TokenSearchInputSchema, TokenSearchResultSchema } from "./token.search.schema";

export const tokenSearchContract = baseContract
  .route({
    method: "GET",
    path: "/token/search",
    description: "Search for tokens by name, symbol, or address",
    successDescription: "List of tokens matching the search criteria",
    tags: ["token"],
  })
  .input(TokenSearchInputSchema)
  .output(TokenSearchResultSchema.array());
