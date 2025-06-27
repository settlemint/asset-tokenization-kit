import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ForwarderModule from '../forwarder';

const IdentityBlockListModule = buildModule('IdentityBlockListModule', (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const identityBlockListModule = m.contract(
    'IdentityBlockListComplianceModule',
    [forwarder]
  );

  return { identityBlockListModule };
});

export default IdentityBlockListModule;
