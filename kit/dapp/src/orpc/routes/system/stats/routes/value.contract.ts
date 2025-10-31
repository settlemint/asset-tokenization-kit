import { baseContract } from "@/orpc/procedures/base.contract";
import {
  StatsValueInputSchema,
  StatsValueOutputSchema,
} from "@/orpc/routes/system/stats/routes/value.schema";

export const statsValueContract = baseContract
  .route({
    method: "GET",
    path: "/system/stats/value",
    description: "Get system-wide total value statistics",
    successDescription: "System total value statistics",
    tags: ["system-stats"],
  })
  .input(StatsValueInputSchema)
  .output(StatsValueOutputSchema);
