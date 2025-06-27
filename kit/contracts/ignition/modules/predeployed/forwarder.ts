import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const ForwarderModule = buildModule('ForwarderModule', (m) => {
  const forwarder = m.contract('ATKForwarder');

  return { forwarder };
});

export default ForwarderModule;
