import { BigInt, log } from "@graphprotocol/graph-ts";
import { Bond } from "../../generated/schema";
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
import { fetchFixedYield, fetchFixedYieldPeriod } from "./fetch/fixed-yield";

export function handleYieldClaimed(event: YieldClaimedEvent): void {
  const schedule = fetchFixedYield(event.address);
  const sender = fetchAccount(event.transaction.from);
  const holder = fetchAccount(event.params.holder);
  const token = Bond.load(schedule.token);

  if (!token) {
    log.warning("Bond token {} not found for FixedYield {}", [
      schedule.token.toHexString(),
      event.address.toHexString(),
    ]);
    return;
  }

  log.info(
    "Fixed yield claimed event: amount={}, holder={}, sender={}, schedule={}, bond={}",
    [
      event.params.totalAmount.toString(),
      holder.id.toHexString(),
      sender.id.toHexString(),
      event.address.toHexString(),
      token.id.toHexString(),
    ]
  );

  yieldClaimedEvent(
    eventId(event),
    event.block.timestamp,
    token.id,
    sender.id,
    holder.id,
    event.params.totalAmount,
    event.params.fromPeriod,
    event.params.toPeriod,
    event.params.periodAmounts,
    event.params.unclaimedYield,
    token.decimals
  );

  schedule.totalClaimedExact = schedule.totalClaimedExact.plus(
    event.params.totalAmount
  );
  schedule.totalClaimed = toDecimals(
    schedule.totalClaimedExact,
    token.decimals
  );
  schedule.underlyingBalanceExact = schedule.underlyingBalanceExact.minus(
    event.params.totalAmount
  );
  const underlyingDecimals = schedule.underlyingAssetDecimals;
  schedule.underlyingBalance = toDecimals(
    schedule.underlyingBalanceExact,
    underlyingDecimals
  );
  schedule.save();

  for (let i = 0; i < event.params.periodAmounts.length; i++) {
    const periodNumber = event.params.fromPeriod.plus(BigInt.fromI32(i));
    const period = fetchFixedYieldPeriod(schedule, periodNumber);

    // Update total claimed for the period if amount > 0
    const claimedAmount = event.params.periodAmounts[i];
    if (claimedAmount.gt(BigInt.zero())) {
      period.totalClaimedExact = period.totalClaimedExact.plus(claimedAmount);
      period.totalClaimed = toDecimals(
        period.totalClaimedExact,
        token.decimals
      );
      period.save();
    }
  }
}

export function handleUnderlyingAssetTopUp(
  event: UnderlyingAssetTopUpEvent
): void {
  const schedule = fetchFixedYield(event.address);
  const sender = fetchAccount(event.transaction.from);
  const from = fetchAccount(event.params.from);
  const token = Bond.load(schedule.token);
  if (!token) return;

  log.info(
    "Fixed yield underlying asset top up event: amount={}, from={}, sender={}, schedule={}, bond={}",
    [
      event.params.amount.toString(),
      from.id.toHexString(),
      sender.id.toHexString(),
      event.address.toHexString(),
      token.id.toHexString(),
    ]
  );

  // Create event record
  underlyingAssetTopUpEvent(
    eventId(event),
    event.block.timestamp,
    token.id,
    sender.id,
    from.id,
    event.params.amount,
    token.decimals
  );

  // Update schedule's underlying balance
  schedule.underlyingBalanceExact = schedule.underlyingBalanceExact.plus(
    event.params.amount
  );
  const underlyingDecimals = schedule.underlyingAssetDecimals;
  schedule.underlyingBalance = toDecimals(
    schedule.underlyingBalanceExact,
    underlyingDecimals
  );
  schedule.save();
}

export function handleUnderlyingAssetWithdrawn(
  event: UnderlyingAssetWithdrawnEvent
): void {
  const schedule = fetchFixedYield(event.address);
  const sender = fetchAccount(event.transaction.from);
  const to = fetchAccount(event.params.to);
  const token = Bond.load(schedule.token);
  if (!token) return;

  log.info(
    "Fixed yield underlying asset withdrawn event: amount={}, to={}, sender={}, schedule={}, bond={}",
    [
      event.params.amount.toString(),
      to.id.toHexString(),
      sender.id.toHexString(),
      event.address.toHexString(),
      token.id.toHexString(),
    ]
  );

  // Create event record
  underlyingAssetWithdrawnEvent(
    eventId(event),
    event.block.timestamp,
    token.id,
    sender.id,
    to.id,
    event.params.amount,
    token.decimals
  );

  // Update schedule's underlying balance
  schedule.underlyingBalanceExact = schedule.underlyingBalanceExact.minus(
    event.params.amount
  );
  const underlyingDecimals = schedule.underlyingAssetDecimals;
  schedule.underlyingBalance = toDecimals(
    schedule.underlyingBalanceExact,
    underlyingDecimals
  );
  schedule.save();
}
