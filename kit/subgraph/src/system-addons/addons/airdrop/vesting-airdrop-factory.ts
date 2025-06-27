import { ByteArray, Bytes, crypto } from '@graphprotocol/graph-ts';
import type { ATKVestingAirdropCreated } from '../../../../generated/templates/VestingAirdropFactory/VestingAirdropFactory';
import { fetchEvent } from '../../../event/fetch/event';
import { fetchAirdrop } from './fetch/airdrop';
import { fetchVestingAirdrop } from './fetch/vesting-airdrop';

export function handleATKVestingAirdropCreated(
  event: ATKVestingAirdropCreated
): void {
  fetchEvent(event, 'ATKVestingAirdropCreated');

  const vestingAirdrop = fetchVestingAirdrop(event.params.airdrop);
  const airdrop = fetchAirdrop(event.params.airdrop);

  airdrop.factory = event.address;
  airdrop.deployedInTransaction = event.transaction.hash;
  airdrop.vestingAirdrop = vestingAirdrop.id;
  airdrop.typeId = Bytes.fromByteArray(
    crypto.keccak256(ByteArray.fromUTF8('ATKVestingAirdrop'))
  );

  airdrop.save();
}
