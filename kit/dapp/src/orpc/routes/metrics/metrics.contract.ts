import { baseContract } from "@/orpc/procedures/base.contract";
import { MetricsSummarySchema } from "@/orpc/routes/metrics/routes/metrics.summary.schema";
import { z } from "zod/v4";

const summary = baseContract
  .route({
    method: "GET",
    path: "/metrics/summary",
    description: "Get aggregated metrics summary for dashboards",
    successDescription: "Metrics summary retrieved successfully",
    tags: ["metrics"],
  })
  .input(z.object({}))
  .output(MetricsSummarySchema);

export const metricsContract = {
  summary,
};