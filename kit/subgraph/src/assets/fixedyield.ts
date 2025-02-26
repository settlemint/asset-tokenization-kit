import { BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { Bond, YieldPeriod } from "../../generated/schema";
import {
  UnderlyingAssetTopUp as UnderlyingAssetTopUpEvent,
  UnderlyingAssetWithdrawn as UnderlyingAssetWithdrawnEvent,
  YieldClaimed as YieldClaimedEvent,
} from "../../generated/templates/FixedYield/FixedYield";
import { fetchAccount } from "../fetch/account";
import { toDecimals } from "../utils/decimals";
import { eventId } from "../utils/events";
import { underlyingAssetTopUpEvent } from "./events/underlyingassettopup";
import { underlyingAssetWithdrawnEvent } from "./events/underlyingassetwithdrawn";
import { yieldClaimedEvent } from "./events/yieldclaimed";
import { fetchFixedYield } from "./fetch/fixed-yield";

export function handleYieldClaimed(event: YieldClaimedEvent): void {
  const schedule = fetchFixedYield(event.address);
  const sender = fetchAccount(event.transaction.from);
  const holder = fetchAccount(event.params.holder);
  const token = Bond.load(schedule.token);
  if (!token) return;

  log.info(
    "Fixed yield claimed event: amount={}, holder={}, sender={}, schedule={}",
    [
      event.params.totalAmount.toString(),
      holder.id.toHexString(),
      sender.id.toHexString(),
      event.address.toHexString(),
    ],
  );

  // Create event record
  yieldClaimedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    holder.id,
    event.params.totalAmount,
    event.params.fromPeriod,
    event.params.toPeriod,
    event.params.periodAmounts,
    event.params.unclaimedYield,
    token.decimals,
  );

  // Update schedule
  schedule.totalClaimedExact = schedule.totalClaimedExact.plus(
    event.params.totalAmount,
  );
  schedule.totalClaimed = toDecimals(
    schedule.totalClaimedExact,
    token.decimals,
  );
  schedule.unclaimedYieldExact = event.params.unclaimedYield;
  schedule.unclaimedYield = toDecimals(
    schedule.unclaimedYieldExact,
    token.decimals,
  );
  schedule.underlyingBalanceExact = schedule.underlyingBalanceExact.minus(
    event.params.totalAmount,
  );
  schedule.underlyingBalance = toDecimals(
    schedule.underlyingBalanceExact,
    token.decimals,
  );
  schedule.save();

  // Update each period's total claimed amount
  // We know the array contains all periods in range, with zeros for periods without yield
  for (let i = 0; i < event.params.periodAmounts.length; i++) {
    const periodId = Bytes.fromUTF8(
      event.address.toHexString() +
        "-" +
        (event.params.fromPeriod.toI32() + i).toString(),
    );
    const period = YieldPeriod.load(periodId);
    if (period && event.params.periodAmounts[i].gt(BigInt.zero())) {
      period.totalClaimedExact = period.totalClaimedExact.plus(
        event.params.periodAmounts[i],
      );
      period.totalClaimed = toDecimals(
        period.totalClaimedExact,
        token.decimals,
      );
      period.save();
    }
  }
}

export function handleUnderlyingAssetTopUp(
  event: UnderlyingAssetTopUpEvent,
): void {
  const schedule = fetchFixedYield(event.address);
  const sender = fetchAccount(event.transaction.from);
  const from = fetchAccount(event.params.from);
  const token = Bond.load(schedule.token);
  if (!token) return;

  log.info(
    "Fixed yield underlying asset top up event: amount={}, from={}, sender={}, schedule={}",
    [
      event.params.amount.toString(),
      from.id.toHexString(),
      sender.id.toHexString(),
      event.address.toHexString(),
    ],
  );

  // Create event record
  underlyingAssetTopUpEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    from.id,
    event.params.amount,
    token.decimals,
  );

  // Update schedule's underlying balance
  schedule.underlyingBalanceExact = schedule.underlyingBalanceExact.plus(
    event.params.amount,
  );
  schedule.underlyingBalance = toDecimals(
    schedule.underlyingBalanceExact,
    token.decimals,
  );
  schedule.save();
}

export function handleUnderlyingAssetWithdrawn(
  event: UnderlyingAssetWithdrawnEvent,
): void {
  const schedule = fetchFixedYield(event.address);
  const sender = fetchAccount(event.transaction.from);
  const to = fetchAccount(event.params.to);
  const token = Bond.load(schedule.token);
  if (!token) return;

  log.info(
    "Fixed yield underlying asset withdrawn event: amount={}, to={}, sender={}, schedule={}",
    [
      event.params.amount.toString(),
      to.id.toHexString(),
      sender.id.toHexString(),
      event.address.toHexString(),
    ],
  );

  // Create event record
  underlyingAssetWithdrawnEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    to.id,
    event.params.amount,
    token.decimals,
  );

  // Update schedule's underlying balance
  schedule.underlyingBalanceExact = schedule.underlyingBalanceExact.minus(
    event.params.amount,
  );
  schedule.underlyingBalance = toDecimals(
    schedule.underlyingBalanceExact,
    token.decimals,
  );
  schedule.save();
}
