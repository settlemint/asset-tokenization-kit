import { baseContract } from "@/orpc/procedures/base.contract";
import {
  AccountSearchInputSchema,
  AccountSearchResultSchema,
} from "@/orpc/routes/account/routes/account.search.schema";

export const accountSearchContract = baseContract
  .route({
    method: "GET",
    path: "/account/search",
    description: "Search for accounts by address",
    successDescription: "List of accounts matching the search criteria",
    tags: ["account"],
  })
  .input(AccountSearchInputSchema)
  .output(AccountSearchResultSchema.array());
