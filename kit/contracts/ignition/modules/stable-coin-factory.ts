import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const StableCoinFactoryModule = buildModule('StableCoinFactoryModule', (m) => {
  const stableCoinFactory = m.contract('StableCoinFactory');

  return { stableCoinFactory };
});

export default StableCoinFactoryModule;
