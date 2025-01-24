import { log } from '@graphprotocol/graph-ts';
import { BondCreated as BondCreatedEvent } from '../generated/BondFactory/BondFactory';
import { Bond } from '../generated/templates';
import { fetchBond } from './fetch/bond';

export function handleBondCreated(event: BondCreatedEvent): void {
  log.info('BondCreated event received: {} {} {} {} {} {} {} {} {}', [
    event.params.token.toHexString(),
    event.params.name,
    event.params.symbol,
    event.params.decimals.toString(),
    event.params.owner.toHexString(),
    event.params.isin,
    event.params.faceValue.toString(),
    event.params.underlyingAsset.toHexString(),
    event.params.tokenCount.toString(),
  ]);
  fetchBond(event.params.token);
  Bond.create(event.params.token);
}
