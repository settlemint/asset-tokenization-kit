import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenStatsValueOutputSchema } from "@/orpc/routes/token/routes/stats/value.schema";

export const tokenStatsValueContract = baseContract
  .route({
    method: "GET",
    path: "/token/stats/value",
    description: "Get token value statistics",
    successDescription: "Value statistics",
    tags: ["token", "stats"],
  })
  .output(TokenStatsValueOutputSchema);
