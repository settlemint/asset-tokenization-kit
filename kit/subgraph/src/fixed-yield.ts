import { BigInt } from '@graphprotocol/graph-ts';
import { Event_UnderlyingAssetMovement, Event_YieldClaimed, YieldPeriod } from '../generated/schema';
import {
  UnderlyingAssetTopUp as UnderlyingAssetTopUpEvent,
  UnderlyingAssetWithdrawn as UnderlyingAssetWithdrawnEvent,
  YieldClaimed as YieldClaimedEvent,
} from '../generated/templates/FixedYield/FixedYield';
import { fetchAccount } from './fetch/account';
import { fetchFixedYield } from './fetch/fixed-yield';
import { eventId } from './utils/events';
import { recordYieldMetricsData } from './utils/timeseries';

export function handleYieldClaimed(event: YieldClaimedEvent): void {
  let schedule = fetchFixedYield(event.address);
  let account = fetchAccount(event.params.holder);

  // Create event record
  let eventClaimed = new Event_YieldClaimed(eventId(event));
  eventClaimed.emitter = schedule.id;
  eventClaimed.timestamp = event.block.timestamp;
  eventClaimed.holder = account.id;
  eventClaimed.amount = event.params.totalAmount;
  eventClaimed.fromPeriodId = event.params.fromPeriod;
  eventClaimed.toPeriodId = event.params.toPeriod;
  eventClaimed.save();

  // Create underlying movement event
  let movement = new Event_UnderlyingAssetMovement(eventId(event));
  movement.emitter = schedule.id;
  movement.timestamp = event.block.timestamp;
  movement.action = 'CLAIM';
  movement.account = account.id;
  movement.amount = event.params.totalAmount.neg(); // Negative for claim
  movement.save();

  // Update schedule
  schedule.totalClaimed = schedule.totalClaimed.plus(event.params.totalAmount);
  schedule.unclaimedYield = event.params.unclaimedYield;
  schedule.underlyingBalance = schedule.underlyingBalance.minus(event.params.totalAmount);
  schedule.save();

  // Update each period's total claimed amount
  // We know the array contains all periods in range, with zeros for periods without yield
  for (let i = 0; i < event.params.periodAmounts.length; i++) {
    let periodId = event.address.toHexString() + '-' + (event.params.fromPeriod.toI32() + i).toString();
    let period = YieldPeriod.load(periodId);
    if (period && event.params.periodAmounts[i].gt(BigInt.zero())) {
      period.totalClaimed = period.totalClaimed.plus(event.params.periodAmounts[i]);
      period.save();
    }
  }

  // Record yield metrics
  recordYieldMetricsData(schedule, event.block.timestamp);
}

export function handleUnderlyingAssetTopUp(event: UnderlyingAssetTopUpEvent): void {
  let schedule = fetchFixedYield(event.address);
  let account = fetchAccount(event.params.from);

  // Create underlying movement event
  let movement = new Event_UnderlyingAssetMovement(eventId(event));
  movement.emitter = schedule.id;
  movement.timestamp = event.block.timestamp;
  movement.action = 'TOP_UP';
  movement.account = account.id;
  movement.amount = event.params.amount; // Positive for top-up
  movement.save();

  // Update schedule's underlying balance
  schedule.underlyingBalance = schedule.underlyingBalance.plus(event.params.amount);
  schedule.save();

  // Record yield metrics
  recordYieldMetricsData(schedule, event.block.timestamp);
}

export function handleUnderlyingAssetWithdrawn(event: UnderlyingAssetWithdrawnEvent): void {
  let schedule = fetchFixedYield(event.address);
  let account = fetchAccount(event.params.to);

  // Create underlying movement event
  let movement = new Event_UnderlyingAssetMovement(eventId(event));
  movement.emitter = schedule.id;
  movement.timestamp = event.block.timestamp;
  movement.action = 'WITHDRAW';
  movement.account = account.id;
  movement.amount = event.params.amount.neg(); // Negative for withdraw
  movement.save();

  // Update schedule's underlying balance
  schedule.underlyingBalance = schedule.underlyingBalance.minus(event.params.amount);
  schedule.save();

  // Record yield metrics
  recordYieldMetricsData(schedule, event.block.timestamp);
}
