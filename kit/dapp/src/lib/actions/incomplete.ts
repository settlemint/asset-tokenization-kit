import { SETTING_KEYS } from "@/lib/db/schema-settings";
import { withTracing } from "@/lib/utils/tracing";
import { isBefore } from "date-fns";
import { DEFAULT_SETTINGS } from "../db/schema-settings";
import { getBondList } from "../queries/bond/bond-list";
import { actionTypes, type ActionType } from "./types";

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
    const { pending: bondPending, upcoming: bondUpcoming } =
      await getIncompleteBondActions();
    return {
      pending: [...bondPending],
      upcoming: [...bondUpcoming],
    };
  }
);

const getIncompleteBondActions = withTracing(
  "queries",
  "getIncompleteBondActions",
  async () => {
    const bonds = await getBondList(
      DEFAULT_SETTINGS[SETTING_KEYS.BASE_CURRENCY]
    );
    const nowTimestampMs = Date.now();

    const bondsNotMatured = bonds.filter((bond) => !bond.isMatured);

    return bondsNotMatured.reduce<{
      upcoming: PendingAction[];
      pending: PendingAction[];
    }>(
      (acc, bond) => {
        const maturityTimestamp = Number(bond.maturityDate);

        if (isBefore(maturityTimestamp * 1000, nowTimestampMs)) {
          acc.pending.push({
            id: bond.id,
            subject: bond.id,
            actionType: actionTypes.BOND_MATURITY,
            activeAtMs: maturityTimestamp,
          });
        } else {
          acc.upcoming.push({
            id: bond.id,
            subject: bond.id,
            actionType: actionTypes.BOND_MATURITY,
            activeAtMs: maturityTimestamp,
          });
        }

        return acc;
      },
      {
        upcoming: [],
        pending: [],
      }
    );
  }
);
