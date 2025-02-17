import { CryptoCurrencyCreated } from '../../generated/CryptoCurrencyFactory/CryptoCurrencyFactory';
import { CryptoCurrency } from '../../generated/templates';
import { accountActivityEvent } from '../assets/events/accountactivity';
import { assetCreatedEvent } from '../assets/events/assetcreated';
import { fetchAssetCount } from '../assets/fetch/asset-count';
import { fetchCryptoCurrency } from '../assets/fetch/cryptocurrency';
import { fetchAccount } from '../fetch/account';
import { AssetType, EventName, FactoryType } from '../utils/enums';
import { eventId } from '../utils/events';
import { fetchFactory } from './fetch/factory';

export function handleCryptoCurrencyCreated(event: CryptoCurrencyCreated): void {
  fetchFactory(event.address, FactoryType.cryptocurrency);
  const sender = fetchAccount(event.transaction.from);
  const asset = fetchCryptoCurrency(event.params.token);
  asset.creator = sender.id;
  asset.save();

  const assetCount = fetchAssetCount(AssetType.cryptocurrency);
  assetCount.count = assetCount.count + 1;
  assetCount.save();

  assetCreatedEvent(eventId(event), event.block.timestamp, asset.id, sender.id);
  accountActivityEvent(sender, EventName.AssetCreated, event.block.timestamp, AssetType.cryptocurrency, asset.id);

  CryptoCurrency.create(event.params.token);
}
