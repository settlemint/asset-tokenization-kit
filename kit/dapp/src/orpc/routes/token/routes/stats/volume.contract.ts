import { baseContract } from "@/orpc/procedures/base.contract";
import {
  StatsVolumeInputSchema,
  StatsVolumeOutputSchema,
} from "@/orpc/routes/token/routes/stats/volume.schema";

export const statsVolumeContract = baseContract
  .route({
    method: "GET",
    path: "/token/stats/{tokenAddress}/volume",
    description: "Get total volume history statistics for a specific token",
    successDescription: "Token total volume history statistics",
    tags: ["token"],
  })
  .input(StatsVolumeInputSchema)
  .output(StatsVolumeOutputSchema);
