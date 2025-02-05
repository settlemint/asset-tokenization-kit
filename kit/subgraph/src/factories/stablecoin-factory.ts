import { StableCoinCreated } from '../../generated/StableCoinFactory/StableCoinFactory';
import { StableCoinCreatedEvent } from '../../generated/schema';
import { StableCoin } from '../../generated/templates';
import { fetchStableCoin } from '../assets/fetch/stablecoin';
import { fetchAccount } from '../fetch/account';
import { FactoryType } from '../utils/enums';
import { eventId } from '../utils/events';
import { fetchFactory } from './fetch/factory';

export function handleStableCoinCreated(event: StableCoinCreated): void {
  fetchFactory(event.address, FactoryType.stablecoin);
  const sender = fetchAccount(event.transaction.from);
  const asset = fetchStableCoin(event.params.token);

  const stableCoinCreatedEvent = new StableCoinCreatedEvent(eventId(event));
  stableCoinCreatedEvent.eventName = 'StableCoinCreated';
  stableCoinCreatedEvent.timestamp = event.block.timestamp;
  stableCoinCreatedEvent.emitter = event.address;
  stableCoinCreatedEvent.sender = sender.id;
  stableCoinCreatedEvent.asset = asset.id;
  stableCoinCreatedEvent.save();

  StableCoin.create(event.params.token);
}
