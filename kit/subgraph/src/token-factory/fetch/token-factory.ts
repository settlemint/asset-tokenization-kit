import { type Address, Bytes } from '@graphprotocol/graph-ts';
import { TokenFactory } from '../../../generated/schema';
import { TokenFactory as TokenFactoryTemplate } from '../../../generated/templates';
import { fetchAccessControl } from '../../access-control/fetch/accesscontrol';
import { fetchAccount } from '../../account/fetch/account';

export function fetchTokenFactory(address: Address): TokenFactory {
  let tokenFactory = TokenFactory.load(address);

  if (!tokenFactory) {
    tokenFactory = new TokenFactory(address);
    tokenFactory.accessControl = fetchAccessControl(address).id;
    tokenFactory.account = fetchAccount(address).id;
    tokenFactory.name = 'unknown';
    tokenFactory.typeId = Bytes.fromHexString('0x00');
    tokenFactory.save();
    TokenFactoryTemplate.create(address);
  }

  return tokenFactory;
}
