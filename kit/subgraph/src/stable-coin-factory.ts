import { StableCoinCreated as StableCoinCreatedEvent } from '../generated/StableCoinFactory/StableCoinFactory';
import { StableCoin } from '../generated/templates';
import { fetchStableCoin } from './fetch/stable-coin';

export function handleStableCoinCreated(event: StableCoinCreatedEvent): void {
  fetchStableCoin(event.params.token);
  StableCoin.create(event.params.token);
}
