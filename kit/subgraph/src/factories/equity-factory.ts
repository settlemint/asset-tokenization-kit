import { EquityCreated } from '../../generated/EquityFactory/EquityFactory';
import { AssetCreatedEvent } from '../../generated/schema';
import { Equity } from '../../generated/templates';
import { fetchEquity } from '../assets/fetch/equity';
import { fetchAccount } from '../fetch/account';
import { FactoryType, AssetType } from '../utils/enums';
import { eventId } from '../utils/events';
import { fetchFactory } from './fetch/factory';
import { accountActivityEvent, AccountActivityEventName } from '../assets/events/accountactivity';

export function handleEquityCreated(event: EquityCreated): void {
  fetchFactory(event.address, FactoryType.equity);
  const sender = fetchAccount(event.transaction.from);
  const asset = fetchEquity(event.params.token);

  const assetCreatedEvent = new AssetCreatedEvent(eventId(event));
  assetCreatedEvent.eventName = 'AssetCreatedEvent';
  assetCreatedEvent.timestamp = event.block.timestamp;
  assetCreatedEvent.emitter = asset.id
  assetCreatedEvent.sender = sender.id;
  assetCreatedEvent.save();

  Equity.create(event.params.token);

  accountActivityEvent(eventId(event), sender, AccountActivityEventName.AssetCreated, event.block.timestamp, AssetType.equity, asset.id);
}
