import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenStatsTotalValueInputSchema,
  TokenStatsTotalValueOutputSchema,
} from "@/orpc/routes/token/routes/stats/total-value.schema";

export const tokenStatsTotalValueContract = baseContract
  .route({
    method: "GET",
    path: "/token/stats/total-value",
    description: "Get total value statistics",
    successDescription: "Total value statistics",
    tags: ["token", "stats"],
  })
  .input(TokenStatsTotalValueInputSchema)
  .output(TokenStatsTotalValueOutputSchema);
