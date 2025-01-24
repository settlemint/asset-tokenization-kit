import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import StableCoinFactoryModule from './stable-coin-factory';

const StableCoinsModule = buildModule('StableCoinsModule', (m) => {
  const { stableCoinFactory } = m.useModule(StableCoinFactoryModule);

  const collateralLivenessSeconds = '3600'; // 1 hour
  const createUSDC = m.call(stableCoinFactory, 'create', ['USD Coin', 'USDC', 6, '', collateralLivenessSeconds], {
    id: 'createUSDC',
  });
  const readUSDCAddress = m.readEventArgument(createUSDC, 'StableCoinCreated', 'token', { id: 'readUSDCAddress' });
  const usdc = m.contractAt('StableCoin', readUSDCAddress, { id: 'usdc' });

  return { usdc };
});

export default StableCoinsModule;
