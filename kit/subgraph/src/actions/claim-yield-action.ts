import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Token, TokenBalance } from "../../generated/schema";
import { fetchFixedYieldSchedule } from "../token-extensions/fixed-yield-schedule/fetch/fixed-yield-schedule";
import { fetchFixedYieldSchedulePeriod } from "../token-extensions/fixed-yield-schedule/fetch/fixed-yield-schedule-period";
import {
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
  const fixedYieldSchedule = fetchFixedYieldSchedule(Address.fromBytes(yield_));
  const periods = fixedYieldSchedule.periods.load();
  for (let periodIndex = 0; periodIndex < periods.length; periodIndex++) {
    const period = fetchFixedYieldSchedulePeriod(periods[periodIndex].id);
    const identifier = createActionIdentifier(ActionName.ClaimYield, [
      yield_,
      balance.account,
      period.id,
    ]);
    createAction(
      timestamp,
      ActionName.ClaimYield,
      yield_,
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
  const fixedYieldSchedule = fetchFixedYieldSchedule(Address.fromBytes(yield_));
  const periods = fixedYieldSchedule.periods.load();
  // Delete all actions to claim yield for this balance
  for (let periodIndex = 0; periodIndex < periods.length; periodIndex++) {
    const period = fetchFixedYieldSchedulePeriod(periods[periodIndex].id);
    const identifier = createActionIdentifier(ActionName.ClaimYield, [
      yield_,
      account,
      period.id,
    ]);
    deleteAction(ActionName.ClaimYield, yield_, identifier);
  }
}
