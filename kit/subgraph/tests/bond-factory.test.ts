import { Address, BigInt } from '@graphprotocol/graph-ts';
import { assert, afterAll, beforeAll, clearStore, describe, test } from 'matchstick-as/assembly/index';
import { handleBondCreated } from '../src/bond-factory';
import { createBondCreatedEvent } from './bond-factory-utils';

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe('Describe entity assertions', () => {
  beforeAll(() => {
    const bond = Address.fromString('0x0000000000000000000000000000000000000001');
    const name = 'Example string value';
    const symbol = 'Example string value';
    const owner = Address.fromString('0x0000000000000000000000000000000000000001');
    const maturityDate = BigInt.fromI32(234);
    const bondCount = BigInt.fromI32(234);
    const newBondCreatedEvent = createBondCreatedEvent(bond, name, symbol, owner, maturityDate, bondCount);
    handleBondCreated(newBondCreatedEvent);
  });

  afterAll(() => {
    clearStore();
  });

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test('BondCreated created and stored', () => {
    assert.entityCount('BondCreated', 1);

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      'BondCreated',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1',
      'bond',
      '0x0000000000000000000000000000000000000001'
    );
    assert.fieldEquals('BondCreated', '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1', 'name', 'Example string value');
    assert.fieldEquals('BondCreated', '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1', 'symbol', 'Example string value');
    assert.fieldEquals(
      'BondCreated',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1',
      'owner',
      '0x0000000000000000000000000000000000000001'
    );
    assert.fieldEquals('BondCreated', '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1', 'maturityDate', '234');
    assert.fieldEquals('BondCreated', '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1', 'bondCount', '234');

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  });
});
