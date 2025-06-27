import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ForwarderModule from './forwarder';

const ComplianceModuleRegistryModule = buildModule(
  'ComplianceModuleRegistryModule',
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);

    const complianceModuleRegistry = m.contract(
      'ATKComplianceModuleRegistryImplementation',
      [forwarder]
    );
    return { complianceModuleRegistry };
  }
);

export default ComplianceModuleRegistryModule;
