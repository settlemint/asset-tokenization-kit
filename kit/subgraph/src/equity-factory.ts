import { EquityCreated as EquityCreatedEvent } from '../generated/EquityFactory/EquityFactory';
import { Equity } from '../generated/templates';
import { fetchEquity } from './fetch/equity';

export function handleEquityCreated(event: EquityCreatedEvent): void {
  fetchEquity(event.params.token);
  Equity.create(event.params.token);
}
