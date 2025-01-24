import { log } from '@graphprotocol/graph-ts';
import { StableCoinCreated as StableCoinCreatedEvent } from '../generated/StableCoinFactory/StableCoinFactory';
import { StableCoin } from '../generated/templates';
import { fetchStableCoin } from './fetch/stable-coin';

export function handleStableCoinCreated(event: StableCoinCreatedEvent): void {
  log.info('StableCoinCreated event received: {} {} {} {} {} {} {}', [
    event.params.token.toHexString(),
    event.params.name,
    event.params.symbol,
    event.params.decimals.toString(),
    event.params.owner.toHexString(),
    event.params.isin,
    event.params.tokenCount.toString(),
  ]);
  fetchStableCoin(event.params.token);
  StableCoin.create(event.params.token);
}
