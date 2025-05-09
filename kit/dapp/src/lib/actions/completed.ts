import { withTracing } from "@/lib/utils/tracing";

export const getCompletedActions = withTracing(
  "queries",
  "getCompletedActions",
  async () => {
    return [];
  }
);
