import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { Event_YieldClaimed } from '../generated/schema';
import { YieldClaimed as YieldClaimedEvent } from '../generated/templates/FixedYield/FixedYield';
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
  eventClaimed.amount = event.params.amount;
  eventClaimed.fromPeriodId = event.params.fromPeriod;
  eventClaimed.toPeriodId = event.params.toPeriod;
  eventClaimed.save();

  // Record yield metrics
  recordYieldMetricsData(schedule, event.block.timestamp);
}
