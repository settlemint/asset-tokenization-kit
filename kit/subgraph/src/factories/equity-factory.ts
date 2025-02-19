import { EquityCreated } from '../../generated/EquityFactory/EquityFactory';
import { Equity } from '../../generated/templates';
import { accountActivityEvent } from '../assets/events/accountactivity';
import { assetCreatedEvent } from '../assets/events/assetcreated';
import { fetchAssetCount } from '../assets/fetch/asset-count';
import { fetchEquity } from '../assets/fetch/equity';
import { fetchAccount } from '../fetch/account';
import { AssetType, EventName, FactoryType } from '../utils/enums';
import { eventId } from '../utils/events';
import { fetchFactory } from './fetch/factory';

export function handleEquityCreated(event: EquityCreated): void {
  fetchFactory(event.address, FactoryType.equity);
  const creator = fetchAccount(event.params.creator);
  const asset = fetchEquity(event.params.token);
  asset.creator = creator.id;
  asset.save();

  const assetCount = fetchAssetCount(AssetType.equity);
  assetCount.count = assetCount.count + 1;
  assetCount.save();

  assetCreatedEvent(eventId(event), event.block.timestamp, asset.id, creator.id);
  accountActivityEvent(creator, EventName.AssetCreated, event.block.timestamp, AssetType.equity, asset.id);

  Equity.create(event.params.token);
}
