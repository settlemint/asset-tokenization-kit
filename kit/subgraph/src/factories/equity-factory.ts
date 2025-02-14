import { EquityCreated } from '../../generated/EquityFactory/EquityFactory';
import { Equity } from '../../generated/templates';
import { assetCreatedEvent } from '../assets/events/assetcreated';
import { fetchEquity } from '../assets/fetch/equity';
import { fetchAccount } from '../fetch/account';
import { AssetType, EventName, FactoryType } from '../utils/enums';
import { eventId } from '../utils/events';
import { fetchFactory } from './fetch/factory';
import { accountActivityEvent } from '../assets/events/accountactivity';

export function handleEquityCreated(event: EquityCreated): void {
  fetchFactory(event.address, FactoryType.equity);
  const sender = fetchAccount(event.transaction.from);
  const asset = fetchEquity(event.params.token);

  assetCreatedEvent(eventId(event), event.block.timestamp, asset.id, sender.id);
  accountActivityEvent(sender, EventName.AssetCreated, event.block.timestamp, AssetType.equity, asset.id);

  Equity.create(event.params.token);
}
