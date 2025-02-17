import { BondCreated } from '../../generated/BondFactory/BondFactory';
import { Bond } from '../../generated/templates';
import { accountActivityEvent } from '../assets/events/accountactivity';
import { assetCreatedEvent } from '../assets/events/assetcreated';
import { fetchBond } from '../assets/fetch/bond';
import { fetchAccount } from '../fetch/account';
import { AssetType, EventName, FactoryType } from '../utils/enums';
import { eventId } from '../utils/events';
import { fetchFactory } from './fetch/factory';
import { fetchAssetCount } from '../assets/fetch/asset-count';

export function handleBondCreated(event: BondCreated): void {
  fetchFactory(event.address, FactoryType.bond);
  const sender = fetchAccount(event.transaction.from);
  const asset = fetchBond(event.params.token);
  asset.creator = sender.id;
  asset.save();

  const assetCount = fetchAssetCount(AssetType.bond);
  assetCount.count = assetCount.count + 1;
  assetCount.save();

  assetCreatedEvent(eventId(event), event.block.timestamp, asset.id, sender.id);
  accountActivityEvent(sender, EventName.AssetCreated, event.block.timestamp, AssetType.bond, asset.id);

  Bond.create(event.params.token);
}
