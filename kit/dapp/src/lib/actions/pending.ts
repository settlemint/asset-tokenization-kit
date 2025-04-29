import { SETTING_KEYS } from "@/lib/db/schema-settings";
import { withTracing } from "@/lib/utils/tracing";
import { isBefore } from "date-fns";
import type { Address } from "viem";
import { DEFAULT_SETTINGS } from "../db/schema-settings";
import { getBondList } from "../queries/bond/bond-list";

export const actionTypes = {
  BOND_MATURITY: "bond-mature",
} as const;

export type ActionType = (typeof actionTypes)[keyof typeof actionTypes];

export interface Action {
  id: string;
  subject: Address | string;
  actionType: ActionType;
  activeAtMs: number;
  completedAtMs: number | null;
}

export const getPendingActions = withTracing(
  "queries",
  "getActions",
  async (): Promise<Action[]> => {
    const { pending: bondPending } = await getBondActions();
    return [...bondPending];
  }
);

export const getBondActions = withTracing(
  "queries",
  "getBondActions",
  async (): Promise<{
    upcoming: Action[];
    pending: Action[];
    completed: Action[];
  }> => {
    const bonds = await getBondList(
      DEFAULT_SETTINGS[SETTING_KEYS.BASE_CURRENCY]
    );
    const nowTimestampMs = Date.now();

    const upcoming: Action[] = [];
    const pending: Action[] = [];
    const completed: Action[] = [];

    for (const bond of bonds) {
      const maturityTimestamp = Number(bond.maturityDate);
      const action: Omit<Action, "description"> = {
        id: `mature-${bond.id}`,
        subject: bond.id,
        actionType: actionTypes.BOND_MATURITY,
        activeAtMs: maturityTimestamp,
        completedAtMs: null,
      };

      if (bond.isMatured) {
        // TODO: Ideally, fetch the actual maturity event timestamp for 'actionDate' if available
        completed.push(action);
      } else if (isBefore(maturityTimestamp * 1000, nowTimestampMs)) {
        pending.push(action);
      } else {
        upcoming.push(action);
      }
    }

    return { upcoming, pending, completed };
  }
);
