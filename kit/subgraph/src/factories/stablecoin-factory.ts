import { StableCoinCreated } from '../../generated/StableCoinFactory/StableCoinFactory';
import { AssetCreatedEvent } from '../../generated/schema';
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

  const assetCreatedEvent = new AssetCreatedEvent(eventId(event));
  assetCreatedEvent.eventName = 'AssetCreatedEvent';
  assetCreatedEvent.timestamp = event.block.timestamp;
  assetCreatedEvent.emitter = event.address;
  assetCreatedEvent.sender = sender.id;
  assetCreatedEvent.asset = asset.id;
  assetCreatedEvent.save();

  StableCoin.create(event.params.token);
}
