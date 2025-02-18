import { FundCreated } from '../../generated/FundFactory/FundFactory';
import { Fund } from '../../generated/templates';
import { accountActivityEvent } from '../assets/events/accountactivity';
import { assetCreatedEvent } from '../assets/events/assetcreated';
import { fetchAssetCount } from '../assets/fetch/asset-count';
import { fetchFund } from '../assets/fetch/fund';
import { fetchAccount } from '../fetch/account';
import { AssetType, EventName, FactoryType } from '../utils/enums';
import { eventId } from '../utils/events';
import { fetchFactory } from './fetch/factory';
import { fetchAssetCount } from '../assets/fetch/asset-count';

export function handleFundCreated(event: FundCreated): void {
  fetchFactory(event.address, FactoryType.fund);
  const sender = fetchAccount(event.transaction.from);
  const asset = fetchFund(event.params.token);
  asset.creator = sender.id;
  asset.save();

  const assetCount = fetchAssetCount(AssetType.fund);
  assetCount.count = assetCount.count + 1;
  assetCount.save();

  assetCreatedEvent(eventId(event), event.block.timestamp, asset.id, sender.id);
  accountActivityEvent(sender, EventName.AssetCreated, event.block.timestamp, AssetType.fund, asset.id);

  Fund.create(event.params.token);
}
