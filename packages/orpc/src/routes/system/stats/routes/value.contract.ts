import { baseContract } from "../../procedures/base.contract";
import {
  StatsValueInputSchema,
  StatsValueOutputSchema,
} from "../../system/stats/routes/value.schema";

export const statsValueContract = baseContract
  .route({
    method: "GET",
    path: "/system/stats/value",
    description: "Get system-wide total value statistics",
    successDescription: "System total value statistics",
    tags: ["stats", "system"],
  })
  .input(StatsValueInputSchema)
  .output(StatsValueOutputSchema);
