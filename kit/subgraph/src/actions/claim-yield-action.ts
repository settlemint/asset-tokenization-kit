import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  Token,
  TokenBalance,
  TokenFixedYieldSchedulePeriod,
} from "../../generated/schema";
import { fetchFixedYieldSchedulePeriod } from "../token-extensions/fixed-yield-schedule/fetch/fixed-yield-schedule-period";
import { updateYield } from "../token-extensions/fixed-yield-schedule/utils/fixed-yield-schedule-utils";
import {
  actionExists,
  ActionName,
  createAction,
  createActionIdentifier,
  deleteAction,
} from "./actions";

export function updateClaimYieldActionsOnBalanceIncrease(
  timestamp: BigInt,
  token: Token,
  balance: TokenBalance
): void {
  const yield_ = token.yield_;
  if (!yield_) {
    return;
  }
  const fixedYieldSchedule = updateYield(token);
  if (!fixedYieldSchedule) {
    return;
  }

  let currentPeriod: TokenFixedYieldSchedulePeriod | null = null;
  if (fixedYieldSchedule.currentPeriod) {
    currentPeriod = fetchFixedYieldSchedulePeriod(
      fixedYieldSchedule.currentPeriod!
    );
  }
  const periods = fixedYieldSchedule.periods.load();
  for (let periodIndex = 0; periodIndex < periods.length; periodIndex++) {
    const period = fetchFixedYieldSchedulePeriod(periods[periodIndex].id);
    if (currentPeriod != null && period.endDate.le(currentPeriod.endDate)) {
      // Skip periods that are finished
      continue;
    }
    const identifier = createActionIdentifier(ActionName.ClaimYield, [
      fixedYieldSchedule.id,
      balance.account,
      period.id,
    ]);
    if (
      actionExists(ActionName.ClaimYield, fixedYieldSchedule.id, identifier)
    ) {
      continue;
    }
    createAction(
      timestamp,
      ActionName.ClaimYield,
      fixedYieldSchedule.id,
      period.endDate,
      null,
      [balance.account],
      null,
      identifier
    );
  }
}

export function updateClaimYieldActionsOnBalanceRemove(
  token: Token,
  account: Address
): void {
  const yield_ = token.yield_;
  if (!yield_) {
    return;
  }
  const fixedYieldSchedule = updateYield(token);
  if (!fixedYieldSchedule) {
    return;
  }

  let currentPeriod: TokenFixedYieldSchedulePeriod | null = null;
  if (fixedYieldSchedule.currentPeriod) {
    currentPeriod = fetchFixedYieldSchedulePeriod(
      fixedYieldSchedule.currentPeriod!
    );
  }
  const periods = fixedYieldSchedule.periods.load();
  // Delete all actions to claim yield for this balance
  for (let periodIndex = 0; periodIndex < periods.length; periodIndex++) {
    const period = fetchFixedYieldSchedulePeriod(periods[periodIndex].id);
    if (currentPeriod != null && period.endDate.le(currentPeriod.endDate)) {
      // Skip periods that are finished
      continue;
    }
    const identifier = createActionIdentifier(ActionName.ClaimYield, [
      fixedYieldSchedule.id,
      account,
      period.id,
    ]);
    deleteAction(ActionName.ClaimYield, fixedYieldSchedule.id, identifier);
  }
}
