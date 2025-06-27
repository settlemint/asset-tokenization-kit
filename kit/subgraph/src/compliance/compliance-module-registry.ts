import { Bytes } from '@graphprotocol/graph-ts';
import {
  AbstractAddressListComplianceModule as AddressListComplianceModuleTemplate,
  AbstractCountryComplianceModule as CountryListComplianceModuleTemplate,
} from '../../generated/templates';
import type { ComplianceModuleRegistered as ComplianceModuleRegisteredEvent } from '../../generated/templates/ComplianceModuleRegistry/ComplianceModuleRegistry';
import { fetchEvent } from '../event/fetch/event';
import { fetchComplianceModule } from './fetch/compliance-module';
import { fetchComplianceModuleRegistry } from './fetch/compliance-module-registry';
import { isAddressListComplianceModule } from './modules/address-list-compliance-module';
import { isCountryListComplianceModule } from './modules/country-list-compliance-module';

export function handleComplianceModuleRegistered(
  event: ComplianceModuleRegisteredEvent
): void {
  fetchEvent(event, 'ComplianceModuleRegistered');

  const complianceModule = fetchComplianceModule(event.params.moduleAddress);
  if (complianceModule.deployedInTransaction.equals(Bytes.empty())) {
    complianceModule.deployedInTransaction = event.transaction.hash;
  }
  complianceModule.name = event.params.name;
  complianceModule.typeId = event.params.typeId;

  if (isAddressListComplianceModule(event.params.typeId)) {
    AddressListComplianceModuleTemplate.create(event.params.moduleAddress);
  }
  if (isCountryListComplianceModule(event.params.typeId)) {
    CountryListComplianceModuleTemplate.create(event.params.moduleAddress);
  }

  complianceModule.complianceModuleRegistry = fetchComplianceModuleRegistry(
    event.address
  ).id;

  complianceModule.save();
}
