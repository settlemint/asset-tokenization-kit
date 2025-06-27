import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts';
import { AirdropAllocation } from '../../../../../generated/schema';
import { setBigNumber } from '../../../../utils/bignumber';
import { getTokenDecimals } from '../../../../utils/token-decimals';
import { fetchAirdrop } from './airdrop';

export function fetchAirdropAllocation(
  airdrop: Bytes,
  index: BigInt,
  recipient: Bytes
): AirdropAllocation {
  const indexBytes = Bytes.fromByteArray(Bytes.fromBigInt(index));
  const id = airdrop.concat(indexBytes);
  let entity = AirdropAllocation.load(id);

  if (entity == null) {
    entity = new AirdropAllocation(id);

    const airdropEntity = fetchAirdrop(airdrop);
    entity.airdrop = airdropEntity.id;
    const tokenAddress = Address.fromBytes(airdropEntity.token);
    const tokenDecimals = getTokenDecimals(tokenAddress);
    setBigNumber(entity, 'amountTransferred', BigInt.zero(), tokenDecimals);
    entity.index = index;
    entity.initialized = true;
    entity.recipient = recipient;

    entity.save();
  }

  return entity;
}
