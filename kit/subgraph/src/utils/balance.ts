import { Address, Bytes } from '@graphprotocol/graph-ts';
import { Account } from '../../generated/schema';

export function balanceId(contractAddress: Address, account: Account | null): Bytes {
  return contractAddress.concat(account ? account.id : Bytes.fromUTF8('totalSupply'));
}
