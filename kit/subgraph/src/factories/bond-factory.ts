import { BondCreated } from '../../generated/BondFactory/BondFactory';
import { Bond } from '../../generated/templates';
import { assetCreatedEvent } from '../assets/events/assetcreated';
import { fetchBond } from '../assets/fetch/bond';
import { fetchAccount } from '../fetch/account';
import { FactoryType } from '../utils/enums';
import { eventId } from '../utils/events';
import { fetchFactory } from './fetch/factory';

export function handleBondCreated(event: BondCreated): void {
  fetchFactory(event.address, FactoryType.bond);
  const sender = fetchAccount(event.transaction.from);
  const asset = fetchBond(event.params.token);

  assetCreatedEvent(eventId(event), event.block.timestamp, asset.id, sender.id);

  Bond.create(event.params.token);
}
