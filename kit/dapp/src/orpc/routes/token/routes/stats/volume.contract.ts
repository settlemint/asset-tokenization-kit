import { baseContract } from "@/orpc/procedures/base.contract";
import {
  VolumeInputSchema,
  VolumeOutputSchema,
} from "@/orpc/routes/token/routes/stats/volume.schema";

export const assetVolumeContract = baseContract
  .route({
    method: "GET",
    path: "/stats/{address}/volume",
    description: "Get transaction volume for a specific asset",
    successDescription: "Asset-specific volume data",
    tags: ["token", "stats", "asset"],
  })
  .input(VolumeInputSchema)
  .output(VolumeOutputSchema);
