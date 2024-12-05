import { BondCreated as BondCreatedEvent } from '../generated/BondFactory/BondFactory';
import { Bond } from '../generated/templates';
import { fetchBond } from './fetch/bond';

export function handleBondCreated(event: BondCreatedEvent): void {
  fetchBond(event.params.token);
  Bond.create(event.params.token);
}
