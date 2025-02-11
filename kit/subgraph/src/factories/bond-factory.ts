import { BondCreated } from '../../generated/BondFactory/BondFactory';
import { Bond } from '../../generated/templates';
import { accountActivityEvent, AccountActivityEventName } from '../assets/events/accountactivity';
import { assetCreatedEvent } from '../assets/events/assetcreated';
import { fetchBond } from '../assets/fetch/bond';
import { fetchAccount } from '../fetch/account';
import { AssetType, FactoryType } from '../utils/enums';
import { eventId } from '../utils/events';
import { fetchFactory } from './fetch/factory';

export function handleBondCreated(event: BondCreated): void {
  fetchFactory(event.address, FactoryType.bond);
  const sender = fetchAccount(event.transaction.from);
  const asset = fetchBond(event.params.token);

  assetCreatedEvent(eventId(event), event.block.timestamp, asset.id, sender.id);
  accountActivityEvent(eventId(event), sender, AccountActivityEventName.AssetCreated, event.block.timestamp, AssetType.bond, asset.id);

  Bond.create(event.params.token);
}
