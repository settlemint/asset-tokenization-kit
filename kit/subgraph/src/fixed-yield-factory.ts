import { log } from '@graphprotocol/graph-ts';
import { FixedYieldCreated as FixedYieldCreatedEvent } from '../generated/FixedYieldFactory/FixedYieldFactory';
import { Event_FixedYieldCreated, YieldPeriod } from '../generated/schema';
import { FixedYield } from '../generated/templates';
import { fetchAccount } from './fetch/account';
import { fetchFixedYield } from './fetch/fixed-yield';
import { eventId } from './utils/events';

export function handleFixedYieldCreated(event: FixedYieldCreatedEvent): void {
  log.info('FixedYieldCreated event received: {} {} {} {} {} {} {} {} {} {}', [
    event.params.schedule.toHexString(),
    event.params.token.toHexString(),
    event.params.underlyingAsset.toHexString(),
    event.params.owner.toHexString(),
    event.params.startDate.toString(),
    event.params.endDate.toString(),
    event.params.rate.toString(),
    event.params.interval.toString(),
    event.params.scheduleCount.toString(),
    event.params.periodEndTimestamps.length.toString(),
  ]);

  // Create the schedule entity
  let schedule = fetchFixedYield(event.params.schedule);
  let owner = fetchAccount(event.params.owner);

  // Create event record
  let eventCreated = new Event_FixedYieldCreated(eventId(event));
  eventCreated.schedule = schedule.id;
  eventCreated.token = event.params.token;
  eventCreated.underlyingAsset = event.params.underlyingAsset;
  eventCreated.owner = owner.id;
  eventCreated.startDate = event.params.startDate;
  eventCreated.endDate = event.params.endDate;
  eventCreated.rate = event.params.rate;
  eventCreated.interval = event.params.interval;
  eventCreated.scheduleCount = event.params.scheduleCount;
  eventCreated.timestamp = event.block.timestamp;
  eventCreated.save();

  // Create period entities using timestamps from event
  let periodStartDate = event.params.startDate;
  for (let i = 0; i < event.params.periods.length; i++) {
    let periodId = BigInt.fromI32(i + 1);
    let periodEndDate = event.params.periods[i];

    let period = new YieldPeriod(event.params.schedule.toHexString() + '-' + periodId.toString());
    period.schedule = schedule.id;
    period.periodId = periodId;
    period.startDate = periodStartDate;
    period.endDate = periodEndDate;
    period.rate = event.params.rate;
    period.totalClaimed = BigInt.zero();
    period.save();

    // Next period starts when current period ends
    periodStartDate = periodEndDate;
  }

  // Start indexing the new schedule
  FixedYield.create(event.params.schedule);
}
