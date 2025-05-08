import { withTracing } from "@/lib/utils/tracing";
import { getBondMaturedEventList } from "../queries/bond/bond-matured-event";
import { actionTypes } from "./types";

export const getCompletedActions = withTracing(
  "queries",
  "getCompletedActions",
  async () => {
    const bondMatureCompletedActions = await getBondMatureCompletedActions();
    return [...bondMatureCompletedActions];
  }
);
const getBondMatureCompletedActions = withTracing(
  "queries",
  "getBondMatureCompletedActions",
  async () => {
    const bondMaturedEvents = await getBondMaturedEventList();

    return bondMaturedEvents.map((event) => ({
      id: event.id,
      subject: event.emitter.id,
      actionType: actionTypes.BOND_MATURITY,
      completedAtMs: event.blockTimestamp,
      sender: event.sender.id,
    }));
  }
);
