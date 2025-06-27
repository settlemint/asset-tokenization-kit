import { type Address, Bytes } from '@graphprotocol/graph-ts';
import { SystemAddonRegistry } from '../../../generated/schema';
import { SystemAddonRegistry as SystemAddonRegistryTemplate } from '../../../generated/templates';
import { fetchAccessControl } from '../../access-control/fetch/accesscontrol';
import { fetchAccount } from '../../account/fetch/account';

export function fetchSystemAddonRegistry(
  address: Address
): SystemAddonRegistry {
  let systemAddonRegistry = SystemAddonRegistry.load(address);

  if (!systemAddonRegistry) {
    systemAddonRegistry = new SystemAddonRegistry(address);
    systemAddonRegistry.accessControl = fetchAccessControl(address).id;
    systemAddonRegistry.account = fetchAccount(address).id;
    systemAddonRegistry.deployedInTransaction = Bytes.empty();
    systemAddonRegistry.save();
    SystemAddonRegistryTemplate.create(address);
  }

  return systemAddonRegistry;
}
