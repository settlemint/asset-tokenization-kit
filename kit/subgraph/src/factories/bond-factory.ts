import { BondCreated } from '../../generated/BondFactory/BondFactory';
import { BondCreatedEvent } from '../../generated/schema';
import { Bond } from '../../generated/templates';
import { fetchBond } from '../assets/fetch/bond';
import { fetchAccount } from '../fetch/account';
import { FactoryType } from '../utils/enums';
import { eventId } from '../utils/events';
import { fetchFactory } from './fetch/factory';

export function handleBondCreated(event: BondCreated): void {
  fetchFactory(event.address, FactoryType.bond);
  const sender = fetchAccount(event.transaction.from);
  const asset = fetchBond(event.params.token);

  const bondCreatedEvent = new BondCreatedEvent(eventId(event));
  bondCreatedEvent.eventName = 'BondCreated';
  bondCreatedEvent.timestamp = event.block.timestamp;
  bondCreatedEvent.emitter = event.address;
  bondCreatedEvent.sender = sender.id;
  bondCreatedEvent.asset = asset.id;
  bondCreatedEvent.save();

  Bond.create(event.params.token);
}
