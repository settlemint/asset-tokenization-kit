import { baseContract } from "@/orpc/procedures/base.contract";
import {
  StatsBondStatusInputSchema,
  StatsBondStatusOutputSchema,
} from "@/orpc/routes/token/routes/stats/bond-status.schema";

export const statsBondStatusContract = baseContract
  .route({
    method: "GET",
    path: "/token/{tokenAddress}/stats/bond-status",
    description: "Get bond status statistics for a specific token",
    successDescription:
      "Bond status statistics including denomination asset information",
    tags: ["token"],
  })
  .input(StatsBondStatusInputSchema)
  .output(StatsBondStatusOutputSchema);
