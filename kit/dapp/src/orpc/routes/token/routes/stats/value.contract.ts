import { baseContract } from "@/orpc/procedures/base.contract";
import {
  ValueInputSchema,
  ValueOutputSchema,
  TotalValueInputSchema,
  TotalValueOutputSchema,
} from "@/orpc/routes/token/routes/stats/value.schema";

export const valueContract = baseContract
  .route({
    method: "GET",
    path: "/stats/value",
    description: "Get system-wide value metrics",
    successDescription: "System value data",
    tags: ["token", "stats"],
  })
  .input(ValueInputSchema)
  .output(ValueOutputSchema);

export const totalValueContract = baseContract
  .route({
    method: "GET",
    path: "/stats/total-value",
    description: "Get system-wide total value metrics",
    successDescription: "System total value data",
    tags: ["token", "stats"],
  })
  .input(TotalValueInputSchema)
  .output(TotalValueOutputSchema);
