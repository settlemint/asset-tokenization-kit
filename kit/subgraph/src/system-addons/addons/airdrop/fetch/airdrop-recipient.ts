import { Address, BigInt, type Bytes } from '@graphprotocol/graph-ts';
import { AirdropRecipient } from '../../../../../generated/schema';
import { fetchAccount } from '../../../../account/fetch/account';
import { setBigNumber } from '../../../../utils/bignumber';
import { getTokenDecimals } from '../../../../utils/token-decimals';
import { fetchAirdrop } from './airdrop';

export function fetchAirdropRecipient(
  airdrop: Bytes,
  recipient: Address
): AirdropRecipient {
  const id = airdrop.concat(recipient);
  let entity = AirdropRecipient.load(id);

  if (entity == null) {
    entity = new AirdropRecipient(id);

    const airdropEntity = fetchAirdrop(airdrop);
    const tokenAddress = Address.fromBytes(airdropEntity.token);
    const tokenDecimals = getTokenDecimals(tokenAddress);

    entity.airdrop = airdropEntity.id;
    entity.account = fetchAccount(recipient).id;
    setBigNumber(entity, 'amountTransferred', BigInt.zero(), tokenDecimals);

    entity.save();
  }

  return entity;
}
