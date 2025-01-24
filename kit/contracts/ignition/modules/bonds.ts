import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import BondFactoryModule from './bond-factory';
import StableCoinFactoryModule from './stable-coin-factory';

const BondsModule = buildModule('BondsModule', (m) => {
  const { bondFactory } = m.useModule(BondFactoryModule);
  const { stableCoinFactory } = m.useModule(StableCoinFactoryModule);

  // Create StableCoin using the factory
  const collateralLivenessSeconds = 7 * 24 * 60 * 60; // 1 week in seconds
  const createStableCoin = m.call(stableCoinFactory, 'create', ['USD Coin', 'USDC', 6, '', collateralLivenessSeconds], {
    id: 'createStableCoin',
  });

  // Get the StableCoin address from the creation event
  const readStableCoinAddress = m.readEventArgument(createStableCoin, 'StableCoinCreated', 'token', {
    id: 'readStableCoinAddress',
  });
  const stableCoin = m.contractAt('StableCoin', readStableCoinAddress, { id: 'stableCoin' });

  const oneYearFromNow = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
  const faceValue = 100_000_000; // 100 USDC (with 6 decimals)

  // Create bond using the deployed StableCoin
  const createBondUSTB = m.call(
    bondFactory,
    'create',
    ['US Treasury Bond', 'USTB', 2, oneYearFromNow, 'US0378331005', faceValue, stableCoin],
    {
      id: 'createBondUSTB',
    }
  );

  const readBondUSTBAddress = m.readEventArgument(createBondUSTB, 'BondCreated', 'token', {
    id: 'readBondUSTBAddress',
  });
  const ustb = m.contractAt('Bond', readBondUSTBAddress, { id: 'bondUSTB' });

  return { ustb, stableCoin };
});

export default BondsModule;
