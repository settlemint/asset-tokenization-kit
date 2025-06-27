import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ForwarderModule from './forwarder';

const SystemModule = buildModule('SystemModule', (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const system = m.contract('ATKSystemImplementation', [forwarder]);

  return { system };
});

export default SystemModule;
