import {
  CheckpointUpdated,
  YieldScheduleSet,
} from "../../../generated/templates/Yield/Yield";
import {
  ActionName,
  createAction,
  createActionIdentifier,
} from "../../actions/actions";
import { fetchEvent } from "../../event/fetch/event";
import { fetchToken } from "../../token/fetch/token";
import { fetchFixedYieldSchedule } from "../fixed-yield-schedule/fetch/fixed-yield-schedule";
import { fetchFixedYieldSchedulePeriod } from "../fixed-yield-schedule/fetch/fixed-yield-schedule-period";
import { fetchYield } from "./fetch/yield";

export function handleCheckpointUpdated(event: CheckpointUpdated): void {
  fetchEvent(event, "CheckpointUpdated");
  // The transfer/burn/mint event handler of the token will update the balance
}

export function handleYieldScheduleSet(event: YieldScheduleSet): void {
  fetchEvent(event, "YieldScheduleSet");
  const tokenYield = fetchYield(event.address);
  const fixedYieldSchedule = fetchFixedYieldSchedule(event.params.schedule);
  tokenYield.schedule = fixedYieldSchedule.id;
  tokenYield.save();
  fixedYieldSchedule.token = event.address;
  fixedYieldSchedule.save();

  // Create ClaimYield actions for all holders for each period
  // Looping balances as part of this event, should be ok as it is not expected that there are many balances yet when this event is emitted
  const token = fetchToken(event.address);
  const balances = token.balances.load();
  const periods = fixedYieldSchedule.periods.load();
  for (let balanceIndex = 0; balanceIndex < balances.length; balanceIndex++) {
    const balance = balances[balanceIndex];
    for (let periodIndex = 0; periodIndex < periods.length; periodIndex++) {
      const period = fetchFixedYieldSchedulePeriod(periods[periodIndex].id);
      createAction(
        event.block.timestamp,
        ActionName.ClaimYield,
        event.params.schedule,
        period.endDate,
        null,
        [balance.account],
        null,
        createActionIdentifier(ActionName.ClaimYield, [
          event.params.schedule,
          balance.account,
          period.id,
        ])
      );
    }
  }
}
