import { type Address, Bytes } from '@graphprotocol/graph-ts';
import { ComplianceModuleRegistry } from '../../../generated/schema';
import { ComplianceModuleRegistry as ComplianceModuleRegistryTemplate } from '../../../generated/templates';
import { fetchAccessControl } from '../../access-control/fetch/accesscontrol';
import { fetchAccount } from '../../account/fetch/account';

export function fetchComplianceModuleRegistry(
  address: Address
): ComplianceModuleRegistry {
  let complianceModuleRegistry = ComplianceModuleRegistry.load(address);

  if (!complianceModuleRegistry) {
    complianceModuleRegistry = new ComplianceModuleRegistry(address);
    complianceModuleRegistry.accessControl = fetchAccessControl(address).id;
    complianceModuleRegistry.account = fetchAccount(address).id;
    complianceModuleRegistry.deployedInTransaction = Bytes.empty();
    complianceModuleRegistry.save();
    ComplianceModuleRegistryTemplate.create(address);
  }

  return complianceModuleRegistry;
}
