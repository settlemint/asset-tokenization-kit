import { FundCreated } from '../../generated/FundFactory/FundFactory';
import { Fund } from '../../generated/templates';
import { assetCreatedEvent } from '../assets/events/assetcreated';
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

  assetCreatedEvent(eventId(event), event.block.timestamp, asset.id, sender.id);

  Fund.create(event.params.token);

  accountActivityEvent(eventId(event), sender, AccountActivityEventName.AssetCreated, event.block.timestamp, AssetType.fund, asset.id);
}
