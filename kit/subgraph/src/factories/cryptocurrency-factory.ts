import { CryptoCurrencyCreated } from '../../generated/CryptoCurrencyFactory/CryptoCurrencyFactory';
import { CryptoCurrency } from '../../generated/templates';
import { assetCreatedEvent } from '../assets/events/assetcreated';
import { fetchCryptoCurrency } from '../assets/fetch/cryptocurrency';
import { fetchAccount } from '../fetch/account';
import { FactoryType } from '../utils/enums';
import { eventId } from '../utils/events';
import { fetchFactory } from './fetch/factory';

export function handleCryptoCurrencyCreated(event: CryptoCurrencyCreated): void {
  fetchFactory(event.address, FactoryType.cryptocurrency);
  const sender = fetchAccount(event.transaction.from);
  const asset = fetchCryptoCurrency(event.params.token);

  assetCreatedEvent(eventId(event), event.block.timestamp, asset.id, sender.id);

  CryptoCurrency.create(event.params.token);
}
