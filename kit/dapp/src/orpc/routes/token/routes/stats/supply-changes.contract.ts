import { baseContract } from "@/orpc/procedures/base.contract";
import {
  StatsSupplyChangesInputSchema,
  StatsSupplyChangesOutputSchema,
} from "@/orpc/routes/token/routes/stats/supply-changes.schema";

export const statsSupplyChangesContract = baseContract
  .route({
    method: "GET",
    path: "/token/stats/{tokenAddress}/supply-changes",
    description:
      "Get supply changes history (minted/burned) statistics for a specific token",
    successDescription: "Token supply changes history statistics",
    tags: ["token"],
  })
  .input(StatsSupplyChangesInputSchema)
  .output(StatsSupplyChangesOutputSchema);
