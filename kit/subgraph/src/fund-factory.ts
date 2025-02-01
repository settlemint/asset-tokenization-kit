import { log } from '@graphprotocol/graph-ts';
import { FundCreated as FundCreatedEvent } from '../generated/FundFactory/FundFactory';
import { Fund } from '../generated/templates';
import { fetchFund } from './fetch/fund';

export function handleFundCreated(event: FundCreatedEvent): void {
  log.info('FundCreated event received: {} {} {} {} {} {} {} {} {}', [
    event.params.token.toHexString(),
    event.params.name,
    event.params.symbol,
    event.params.decimals.toString(),
    event.params.owner.toHexString(),
    event.params.isin,
    event.params.fundClass,
    event.params.fundCategory,
    event.params.managementFeeBps.toString(),
  ]);
  fetchFund(event.params.token);
  Fund.create(event.params.token);
}
