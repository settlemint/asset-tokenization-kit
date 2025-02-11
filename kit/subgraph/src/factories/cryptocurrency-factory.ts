import { CryptoCurrencyCreated } from '../../generated/CryptoCurrencyFactory/CryptoCurrencyFactory';
import { CryptoCurrency } from '../../generated/templates';
import { assetCreatedEvent } from '../assets/events/assetcreated';
import { fetchCryptoCurrency } from '../assets/fetch/cryptocurrency';
import { fetchAccount } from '../fetch/account';
import { FactoryType, AssetType, EventName } from '../utils/enums';
import { eventId } from '../utils/events';
import { fetchFactory } from './fetch/factory';
import { accountActivityEvent } from '../assets/events/accountactivity';

export function handleCryptoCurrencyCreated(event: CryptoCurrencyCreated): void {
  fetchFactory(event.address, FactoryType.cryptocurrency);
  const sender = fetchAccount(event.transaction.from);
  const asset = fetchCryptoCurrency(event.params.token);

  assetCreatedEvent(eventId(event), event.block.timestamp, asset.id, sender.id);
  accountActivityEvent(eventId(event), sender, EventName.AssetCreated, event.block.timestamp, AssetType.cryptocurrency, asset.id);

  CryptoCurrency.create(event.params.token);
}
