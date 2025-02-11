import { FixedYieldCreated as FixedYieldCreatedEvent } from '../../generated/FixedYieldFactory/FixedYieldFactory';
import { FixedYield } from '../../generated/templates';
import { accountActivityEvent } from '../assets/events/accountactivity';
import { AccountActivityEventName } from '../assets/events/accountactivity';
import { AssetType, FactoryType } from '../utils/enums';
import { eventId } from '../utils/events';
import { fetchFactory } from './fetch/factory';
import { fetchAccount } from '../fetch/account';
import { fetchEquity } from '../assets/fetch/equity';

export function handleFixedYieldCreated(event: FixedYieldCreatedEvent): void {
  const sender = fetchAccount(event.transaction.from);
  const asset = fetchEquity(event.params.schedule);

  fetchFactory(event.address, FactoryType.fixedyield);
  FixedYield.create(event.params.schedule);

  accountActivityEvent(eventId(event), sender.id, AccountActivityEventName.AssetCreated, event.block.timestamp, AssetType.fixedyield, asset.id);
}
