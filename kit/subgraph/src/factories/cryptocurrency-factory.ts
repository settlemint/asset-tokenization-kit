import { CryptoCurrencyCreated } from '../../generated/CryptoCurrencyFactory/CryptoCurrencyFactory';
import { CryptoCurrencyCreatedEvent } from '../../generated/schema';
import { CryptoCurrency } from '../../generated/templates';
import { fetchCryptoCurrency } from '../assets/fetch/cryptocurrency';
import { fetchAccount } from '../fetch/account';
import { FactoryType } from '../utils/enums';
import { eventId } from '../utils/events';
import { fetchFactory } from './fetch/factory';

export function handleCryptoCurrencyCreated(event: CryptoCurrencyCreated): void {
  fetchFactory(event.address, FactoryType.cryptocurrency);
  const sender = fetchAccount(event.transaction.from);
  const asset = fetchCryptoCurrency(event.params.token);

  const cryptoCurrencyCreatedEvent = new CryptoCurrencyCreatedEvent(eventId(event));
  cryptoCurrencyCreatedEvent.eventName = 'CryptoCurrencyCreated';
  cryptoCurrencyCreatedEvent.timestamp = event.block.timestamp;
  cryptoCurrencyCreatedEvent.emitter = event.address;
  cryptoCurrencyCreatedEvent.sender = sender.id;
  cryptoCurrencyCreatedEvent.asset = asset.id;
  cryptoCurrencyCreatedEvent.save();

  CryptoCurrency.create(event.params.token);
}
