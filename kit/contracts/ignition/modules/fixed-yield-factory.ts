import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const FixedYieldFactoryModule = buildModule('FixedYieldFactoryModule', (m) => {
  const fixedYieldFactory = m.contract('FixedYieldFactory');

  return { fixedYieldFactory };
});

export default FixedYieldFactoryModule;
