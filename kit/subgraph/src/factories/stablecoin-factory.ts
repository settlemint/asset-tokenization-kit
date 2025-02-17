import { StableCoinCreated } from '../../generated/StableCoinFactory/StableCoinFactory';
import { StableCoin } from '../../generated/templates';
import { accountActivityEvent } from '../assets/events/accountactivity';
import { assetCreatedEvent } from '../assets/events/assetcreated';
import { fetchStableCoin } from '../assets/fetch/stablecoin';
import { fetchAccount } from '../fetch/account';
import { AssetType, EventName, FactoryType } from '../utils/enums';
import { eventId } from '../utils/events';
import { fetchFactory } from './fetch/factory';
import { fetchAssetCount } from '../assets/fetch/asset-count';

export function handleStableCoinCreated(event: StableCoinCreated): void {
  fetchFactory(event.address, FactoryType.stablecoin);
  const sender = fetchAccount(event.transaction.from);
  const asset = fetchStableCoin(event.params.token);
  asset.creator = sender.id;
  asset.save();

  const assetCount = fetchAssetCount(AssetType.stablecoin);
  assetCount.count = assetCount.count + 1;
  assetCount.save();

  assetCreatedEvent(eventId(event), event.block.timestamp, asset.id, sender.id);
  accountActivityEvent(sender, EventName.AssetCreated, event.block.timestamp, AssetType.stablecoin, asset.id);

  StableCoin.create(event.params.token);
}
