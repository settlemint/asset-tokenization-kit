import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const EquityFactoryModule = buildModule('EquityFactoryModule', (m) => {
  const equityFactory = m.contract('EquityFactory');

  return { equityFactory };
});

export default EquityFactoryModule;
