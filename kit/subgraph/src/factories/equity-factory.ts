import { EquityCreated } from '../../generated/EquityFactory/EquityFactory';
import { Equity } from '../../generated/templates';
import { accountActivityEvent } from '../assets/events/accountactivity';
import { assetCreatedEvent } from '../assets/events/assetcreated';
import { fetchEquity } from '../assets/fetch/equity';
import { fetchAccount } from '../fetch/account';
import { AssetType, EventName, FactoryType } from '../utils/enums';
import { eventId } from '../utils/events';
import { fetchFactory } from './fetch/factory';
import { fetchAssetCount } from '../assets/fetch/asset-count';

export function handleEquityCreated(event: EquityCreated): void {
  fetchFactory(event.address, FactoryType.equity);
  const sender = fetchAccount(event.transaction.from);
  const asset = fetchEquity(event.params.token);
  asset.creator = sender.id;
  asset.save();

  const assetCount = fetchAssetCount(AssetType.equity);
  assetCount.count = assetCount.count + 1;
  assetCount.save();

  assetCreatedEvent(eventId(event), event.block.timestamp, asset.id, sender.id);
  accountActivityEvent(sender, EventName.AssetCreated, event.block.timestamp, AssetType.equity, asset.id);

  Equity.create(event.params.token);
}
