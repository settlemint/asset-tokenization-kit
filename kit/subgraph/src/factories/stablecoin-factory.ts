import { StableCoinCreated } from '../../generated/StableCoinFactory/StableCoinFactory';
import { StableCoin } from '../../generated/templates';
import { assetCreatedEvent } from '../assets/events/assetcreated';
import { fetchStableCoin } from '../assets/fetch/stablecoin';
import { fetchAccount } from '../fetch/account';
import { FactoryType } from '../utils/enums';
import { eventId } from '../utils/events';
import { fetchFactory } from './fetch/factory';

export function handleStableCoinCreated(event: StableCoinCreated): void {
  fetchFactory(event.address, FactoryType.stablecoin);
  const sender = fetchAccount(event.transaction.from);
  const asset = fetchStableCoin(event.params.token);

  assetCreatedEvent(eventId(event), event.block.timestamp, asset.id, sender.id);

  StableCoin.create(event.params.token);
}
