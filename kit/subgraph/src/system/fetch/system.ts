import { type Address, Bytes } from '@graphprotocol/graph-ts';
import { System } from '../../../generated/schema';
import { System as SystemTemplate } from '../../../generated/templates';
import { fetchAccessControl } from '../../access-control/fetch/accesscontrol';
import { fetchAccount } from '../../account/fetch/account';

export function fetchSystem(address: Address): System {
  let system = System.load(address);

  if (!system) {
    system = new System(address);
    system.accessControl = fetchAccessControl(address).id;
    system.account = fetchAccount(address).id;
    system.deployedInTransaction = Bytes.empty();
    system.save();
    SystemTemplate.create(address);
  }

  return system;
}
