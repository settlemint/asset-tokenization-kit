import { Address, Bytes } from '@graphprotocol/graph-ts';
import { Identity } from '../../../generated/schema';
import { Identity as IdentityTemplate } from '../../../generated/templates';

export function fetchIdentity(address: Address): Identity {
  let identity = Identity.load(address);

  if (!identity) {
    identity = new Identity(address);
    identity.registry = Address.zero();
    identity.deployedInTransaction = Bytes.empty();
    identity.save();
    IdentityTemplate.create(address);
  }

  return identity;
}
