import { log } from '@graphprotocol/graph-ts';
import { CryptoCurrencyCreated as CryptoCurrencyCreatedEvent } from '../generated/CryptoCurrencyFactory/CryptoCurrencyFactory';
import { CryptoCurrency } from '../generated/templates';
import { fetchCryptoCurrency } from './fetch/crypto-currency';

export function handleCryptoCurrencyCreated(event: CryptoCurrencyCreatedEvent): void {
  log.info('CryptoCurrencyCreated event received: {} {} {} {} {}', [
    event.params.token.toHexString(),
    event.params.name,
    event.params.symbol,
    event.params.decimals,
    event.params.owner.toHexString(),
    event.params.tokenCount.toString(),
  ]);
  fetchCryptoCurrency(event.params.token);
  CryptoCurrency.create(event.params.token);
}
