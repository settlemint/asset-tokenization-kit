import { withTracing } from "@/lib/utils/tracing";
import type { ActionType } from "./types";

type PendingAction = {
  id: string;
  subject: string;
  actionType: ActionType;
  activeAtMs: number;
};

export const getIncompleteActions = withTracing(
  "queries",
  "getIncompleteActions",
  async () => {
    return {
      pending: [],
      upcoming: [],
    };
  }
);
