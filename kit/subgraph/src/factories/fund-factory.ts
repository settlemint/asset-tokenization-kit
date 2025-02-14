import { FundCreated } from '../../generated/FundFactory/FundFactory';
import { Fund } from '../../generated/templates';
import { accountActivityEvent } from '../assets/events/accountactivity';
import { assetCreatedEvent } from '../assets/events/assetcreated';
import { fetchFund } from '../assets/fetch/fund';
import { fetchAccount } from '../fetch/account';
import { AssetType, EventName, FactoryType } from '../utils/enums';
import { eventId } from '../utils/events';
import { fetchFactory } from './fetch/factory';

export function handleFundCreated(event: FundCreated): void {
  fetchFactory(event.address, FactoryType.fund);
  const sender = fetchAccount(event.transaction.from);
  const asset = fetchFund(event.params.token);
  asset.creator = sender.id;
  asset.save();

  assetCreatedEvent(eventId(event), event.block.timestamp, asset.id, sender.id);
  accountActivityEvent(sender, EventName.AssetCreated, event.block.timestamp, AssetType.fund, asset.id);

  Fund.create(event.params.token);
}
