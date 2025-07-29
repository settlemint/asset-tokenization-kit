import { baseContract } from "@/orpc/procedures/base.contract";
import {
  ActivityInputSchema,
  ActivityOutputSchema,
} from "@/orpc/routes/token/routes/stats/activity.schema";

export const activityContract = baseContract
  .route({
    method: "GET",
    path: "/stats/activity",
    description: "Get system-wide activity breakdown by asset type",
    successDescription: "System activity by asset data",
    tags: ["token", "stats"],
  })
  .input(ActivityInputSchema)
  .output(ActivityOutputSchema);

export const assetActivityContract = baseContract
  .route({
    method: "GET",
    path: "/stats/{address}/activity",
    description: "Get activity data for a specific asset",
    successDescription: "Asset-specific activity data",
    tags: ["token", "stats", "asset"],
  })
  .input(ActivityInputSchema)
  .output(ActivityOutputSchema);
