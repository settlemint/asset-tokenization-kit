import { FundCreated } from '../../generated/FundFactory/FundFactory';
import { FundCreatedEvent } from '../../generated/schema';
import { Fund } from '../../generated/templates';
import { fetchFund } from '../assets/fetch/fund';
import { fetchAccount } from '../fetch/account';
import { FactoryType } from '../utils/enums';
import { eventId } from '../utils/events';
import { fetchFactory } from './fetch/factory';

export function handleFundCreated(event: FundCreated): void {
  fetchFactory(event.address, FactoryType.fund);
  const sender = fetchAccount(event.transaction.from);
  const asset = fetchFund(event.params.token);

  const fundCreatedEvent = new FundCreatedEvent(eventId(event));
  fundCreatedEvent.eventName = 'FundCreated';
  fundCreatedEvent.timestamp = event.block.timestamp;
  fundCreatedEvent.emitter = event.address;
  fundCreatedEvent.sender = sender.id;
  fundCreatedEvent.asset = asset.id;
  fundCreatedEvent.save();

  Fund.create(event.params.token);
}
