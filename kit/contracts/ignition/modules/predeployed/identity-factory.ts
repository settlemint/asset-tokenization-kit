import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ForwarderModule from './forwarder';

const IdentityFactoryModule = buildModule('IdentityFactoryModule', (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const identityFactory = m.contract('ATKIdentityFactoryImplementation', [
    forwarder,
  ]);

  return { identityFactory };
});

export default IdentityFactoryModule;
