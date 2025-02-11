import { FundCreated } from '../../generated/FundFactory/FundFactory';
import { AssetCreatedEvent } from '../../generated/schema';
import { Fund } from '../../generated/templates';
import { fetchFund } from '../assets/fetch/fund';
import { fetchAccount } from '../fetch/account';
import { AssetType, FactoryType } from '../utils/enums';
import { eventId } from '../utils/events';
import { fetchFactory } from './fetch/factory';
import { accountActivityEvent, AccountActivityEventName } from '../assets/events/accountactivity';

export function handleFundCreated(event: FundCreated): void {
  fetchFactory(event.address, FactoryType.fund);
  const sender = fetchAccount(event.transaction.from);
  const asset = fetchFund(event.params.token);

  const assetCreatedEvent = new AssetCreatedEvent(eventId(event));
  assetCreatedEvent.eventName = 'AssetCreatedEvent';
  assetCreatedEvent.timestamp = event.block.timestamp;
  assetCreatedEvent.emitter = asset.id
  assetCreatedEvent.sender = sender.id;
  assetCreatedEvent.save();

  Fund.create(event.params.token);

  accountActivityEvent(eventId(event), sender.id, AccountActivityEventName.AssetCreated, event.block.timestamp, AssetType.fund, asset.id);
}
