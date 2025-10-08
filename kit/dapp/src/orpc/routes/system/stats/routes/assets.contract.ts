import { baseContract } from "@/orpc/procedures/base.contract";
import {
  StatsAssetsInputSchema,
  StatsAssetsOutputSchema,
} from "@/orpc/routes/system/stats/routes/assets.schema";

export const statsAssetsContract = baseContract
  .route({
    method: "GET",
    path: "/system/stats/assets",
    description:
      "Get system-wide asset count and value statistics with breakdowns by type",
    successDescription: "System asset count and value statistics",
    tags: ["stats", "system"],
  })
  .input(StatsAssetsInputSchema)
  .output(StatsAssetsOutputSchema);
