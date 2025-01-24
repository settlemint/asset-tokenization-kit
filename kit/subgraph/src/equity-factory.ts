import { log } from '@graphprotocol/graph-ts';
import { EquityCreated as EquityCreatedEvent } from '../generated/EquityFactory/EquityFactory';
import { Equity } from '../generated/templates';
import { fetchEquity } from './fetch/equity';

export function handleEquityCreated(event: EquityCreatedEvent): void {
  log.info('EquityCreated event received: {} {} {} {} {} {} {} {} {}', [
    event.params.token.toHexString(),
    event.params.name,
    event.params.symbol,
    event.params.decimals.toString(),
    event.params.owner.toHexString(),
    event.params.isin,
    event.params.equityClass,
    event.params.equityCategory,
    event.params.tokenCount.toString(),
  ]);
  fetchEquity(event.params.token);
  Equity.create(event.params.token);
}
