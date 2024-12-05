import { CryptoCurrencyCreated as CryptoCurrencyCreatedEvent } from '../generated/CryptoCurrencyFactory/CryptoCurrencyFactory';
import { CryptoCurrency } from '../generated/templates';
import { fetchCryptoCurrency } from './fetch/crypto-currency';

export function handleCryptoCurrencyCreated(event: CryptoCurrencyCreatedEvent): void {
  fetchCryptoCurrency(event.params.token);
  CryptoCurrency.create(event.params.token);
}
