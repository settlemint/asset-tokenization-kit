import { Bytes } from '@graphprotocol/graph-ts';
import type { ATKSystemCreated } from '../../generated/SystemFactory/SystemFactory';
import { fetchEvent } from '../event/fetch/event';
import { fetchSystem } from '../system/fetch/system';

export function handleATKSystemCreated(event: ATKSystemCreated): void {
  fetchEvent(event, 'SystemCreated');
  const system = fetchSystem(event.params.systemAddress);
  if (system.deployedInTransaction.equals(Bytes.empty())) {
    system.deployedInTransaction = event.transaction.hash;
  }
  system.save();
}
