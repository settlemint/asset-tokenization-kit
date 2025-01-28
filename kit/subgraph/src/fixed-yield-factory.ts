import { log } from '@graphprotocol/graph-ts';
import { FixedYieldCreated as FixedYieldCreatedEvent } from '../generated/FixedYieldFactory/FixedYieldFactory';
import { FixedYield } from '../generated/templates';
import { fetchFixedYield } from './fetch/fixed-yield';

export function handleFixedYieldCreated(event: FixedYieldCreatedEvent): void {
  log.info('FixedYieldCreated event received: {} {} {} {} {} {} {} {} {}', [
    event.params.schedule.toHexString(),
    event.params.token.toHexString(),
    event.params.underlyingAsset.toHexString(),
    event.params.owner.toHexString(),
    event.params.startDate.toString(),
    event.params.endDate.toString(),
    event.params.rate.toString(),
    event.params.interval.toString(),
    event.params.scheduleCount.toString(),
  ]);

  fetchFixedYield(event.params.schedule);
  FixedYield.create(event.params.schedule);
}
