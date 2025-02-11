import { CryptoCurrencyCreated } from '../../generated/CryptoCurrencyFactory/CryptoCurrencyFactory';
import { AssetCreatedEvent } from '../../generated/schema';
import { CryptoCurrency } from '../../generated/templates';
import { fetchCryptoCurrency } from '../assets/fetch/cryptocurrency';
import { fetchAccount } from '../fetch/account';
import { FactoryType, AssetType } from '../utils/enums';
import { eventId } from '../utils/events';
import { fetchFactory } from './fetch/factory';
import { accountActivityEvent, AccountActivityEventName } from '../assets/events/accountactivity';

export function handleCryptoCurrencyCreated(event: CryptoCurrencyCreated): void {
  fetchFactory(event.address, FactoryType.cryptocurrency);
  const sender = fetchAccount(event.transaction.from);
  const asset = fetchCryptoCurrency(event.params.token);

  const assetCreatedEvent = new AssetCreatedEvent(eventId(event));
  assetCreatedEvent.eventName = 'AssetCreatedEvent';
  assetCreatedEvent.timestamp = event.block.timestamp;
  assetCreatedEvent.emitter = asset.id
  assetCreatedEvent.sender = sender.id;
  assetCreatedEvent.save();

  CryptoCurrency.create(event.params.token);

  accountActivityEvent(eventId(event), sender.id, AccountActivityEventName.AssetCreated, event.block.timestamp, AssetType.cryptocurrency, asset.id);
}
