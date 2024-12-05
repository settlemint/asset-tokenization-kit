import { type Address, type BigInt, ethereum } from '@graphprotocol/graph-ts';
import { newMockEvent } from 'matchstick-as';
import type { BondCreated } from '../generated/BondFactory/BondFactory';

export function createBondCreatedEvent(
  bond: Address,
  name: string,
  symbol: string,
  owner: Address,
  maturityDate: BigInt,
  bondCount: BigInt
): BondCreated {
  const bondCreatedEvent = changetype<BondCreated>(newMockEvent());

  bondCreatedEvent.parameters = new Array();

  bondCreatedEvent.parameters.push(new ethereum.EventParam('bond', ethereum.Value.fromAddress(bond)));
  bondCreatedEvent.parameters.push(new ethereum.EventParam('name', ethereum.Value.fromString(name)));
  bondCreatedEvent.parameters.push(new ethereum.EventParam('symbol', ethereum.Value.fromString(symbol)));
  bondCreatedEvent.parameters.push(new ethereum.EventParam('owner', ethereum.Value.fromAddress(owner)));
  bondCreatedEvent.parameters.push(
    new ethereum.EventParam('maturityDate', ethereum.Value.fromUnsignedBigInt(maturityDate))
  );
  bondCreatedEvent.parameters.push(new ethereum.EventParam('bondCount', ethereum.Value.fromUnsignedBigInt(bondCount)));

  return bondCreatedEvent;
}
