import { EquityCreated } from '../../generated/EquityFactory/EquityFactory';
import { EquityCreatedEvent } from '../../generated/schema';
import { Equity } from '../../generated/templates';
import { fetchEquity } from '../assets/fetch/equity';
import { fetchAccount } from '../fetch/account';
import { FactoryType } from '../utils/enums';
import { eventId } from '../utils/events';
import { fetchFactory } from './fetch/factory';

export function handleEquityCreated(event: EquityCreated): void {
  fetchFactory(event.address, FactoryType.equity);
  const sender = fetchAccount(event.transaction.from);
  const asset = fetchEquity(event.params.token);

  const equityCreatedEvent = new EquityCreatedEvent(eventId(event));
  equityCreatedEvent.eventName = 'EquityCreated';
  equityCreatedEvent.timestamp = event.block.timestamp;
  equityCreatedEvent.emitter = event.address;
  equityCreatedEvent.sender = sender.id;
  equityCreatedEvent.asset = asset.id;
  equityCreatedEvent.save();

  Equity.create(event.params.token);
}
