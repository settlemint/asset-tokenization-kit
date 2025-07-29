import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenStatsSystemValueInputSchema,
  TokenStatsSystemValueOutputSchema,
} from "@/orpc/routes/token/routes/stats/system/value.schema";

export const tokenStatsSystemValueContract = baseContract
  .route({
    method: "GET",
    path: "/token/stats/system/value",
    description: "Get system-wide total value statistics",
    successDescription: "System total value statistics",
    tags: ["token", "stats", "system"],
  })
  .input(TokenStatsSystemValueInputSchema)
  .output(TokenStatsSystemValueOutputSchema);
