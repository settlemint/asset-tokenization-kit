import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ForwarderModule from './forwarder';

const ComplianceModule = buildModule('ComplianceModule', (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const compliance = m.contract('ATKComplianceImplementation', [forwarder]);

  return { compliance };
});

export default ComplianceModule;
