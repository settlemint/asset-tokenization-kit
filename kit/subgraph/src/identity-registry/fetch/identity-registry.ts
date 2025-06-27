import { type Address, Bytes } from '@graphprotocol/graph-ts';
import { IdentityRegistry } from '../../../generated/schema';
import { IdentityRegistry as IdentityRegistryTemplate } from '../../../generated/templates';
import { fetchAccessControl } from '../../access-control/fetch/accesscontrol';
import { fetchAccount } from '../../account/fetch/account';

export function fetchIdentityRegistry(address: Address): IdentityRegistry {
  let identityRegistry = IdentityRegistry.load(address);

  if (!identityRegistry) {
    identityRegistry = new IdentityRegistry(address);
    identityRegistry.accessControl = fetchAccessControl(address).id;
    identityRegistry.account = fetchAccount(address).id;
    identityRegistry.deployedInTransaction = Bytes.empty();
    identityRegistry.save();
    IdentityRegistryTemplate.create(address);
  }

  return identityRegistry;
}
