import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const FundFactoryModule = buildModule('FundFactoryModule', (m) => {
  const fundFactory = m.contract('FundFactory');

  return { fundFactory };
});

export default FundFactoryModule;
