import { baseContract } from "@/orpc/procedures/base.contract";
import {
  StatsAssetsInputSchema,
  StatsAssetsOutputSchema,
} from "@/orpc/routes/system/stats/routes/assets.schema";

export const statsAssetsContract = baseContract
  .route({
    method: "GET",
    path: "/system/stats/assets",
    description: "Get system-wide asset count statistics",
    successDescription: "System asset count statistics",
    tags: ["stats", "system"],
  })
  .input(StatsAssetsInputSchema)
  .output(StatsAssetsOutputSchema);
