import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ForwarderModule from '../forwarder';

const IdentityAllowListModule = buildModule('IdentityAllowListModule', (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const identityAllowListModule = m.contract(
    'IdentityAllowListComplianceModule',
    [forwarder]
  );

  return { identityAllowListModule };
});

export default IdentityAllowListModule;
