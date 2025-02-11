import { BondCreated } from '../../generated/BondFactory/BondFactory';
import { AssetCreatedEvent } from '../../generated/schema';
import { Bond } from '../../generated/templates';
import { accountActivityEvent, AccountActivityEventName } from '../assets/events/accountactivity';
import { fetchBond } from '../assets/fetch/bond';
import { fetchAccount } from '../fetch/account';
import { AssetType, FactoryType } from '../utils/enums';
import { eventId } from '../utils/events';
import { fetchFactory } from './fetch/factory';

export function handleBondCreated(event: BondCreated): void {
  fetchFactory(event.address, FactoryType.bond);
  const sender = fetchAccount(event.transaction.from);
  const asset = fetchBond(event.params.token);

  const assetCreatedEvent = new AssetCreatedEvent(eventId(event));
  assetCreatedEvent.eventName = 'AssetCreatedEvent';
  assetCreatedEvent.timestamp = event.block.timestamp;
  assetCreatedEvent.emitter = asset.id
  assetCreatedEvent.sender = sender.id;
  assetCreatedEvent.save();

  Bond.create(event.params.token);

  accountActivityEvent(eventId(event), sender, AccountActivityEventName.AssetCreated, event.block.timestamp, AssetType.bond, asset.id);
}
