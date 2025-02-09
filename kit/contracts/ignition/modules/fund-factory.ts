import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ForwarderModule from './forwarder';

const FundFactoryModule = buildModule('FundFactoryModule', (m) => {
  const { forwarder } = m.useModule(ForwarderModule);
  const fundFactory = m.contract('FundFactory', [forwarder]);

  return { fundFactory };
});

export default FundFactoryModule;
