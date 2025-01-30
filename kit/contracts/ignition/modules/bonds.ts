import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import BondFactoryModule from './bond-factory';
import FixedYieldFactoryModule from './fixed-yield-factory';
import StableCoinFactoryModule from './stable-coin-factory';

const BondsModule = buildModule('BondsModule', (m) => {
  // Get the deployer address which will be the owner
  const deployer = m.getAccount(0);

  const { bondFactory } = m.useModule(BondFactoryModule);
  const { stableCoinFactory } = m.useModule(StableCoinFactoryModule);
  const { fixedYieldFactory } = m.useModule(FixedYieldFactoryModule);

  // Create StableCoin using the factory
  const collateralLivenessSeconds = 7 * 24 * 60 * 60; // 1 week in seconds
  const createStableCoin = m.call(stableCoinFactory, 'create', ['USD Coin', 'USDC', 6, '', collateralLivenessSeconds], {
    id: 'createStableCoin',
    from: deployer,
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
    ['US Treasury Bond', 'USTB', 2, 'US0378331005', 1000 * 10 ** 2, oneYearFromNow, faceValue, stableCoin],
    {
      id: 'createBondUSTB',
      from: deployer,
    }
  );

  const readBondUSTBAddress = m.readEventArgument(createBondUSTB, 'BondCreated', 'token', {
    id: 'readBondUSTBAddress',
  });
  const ustb = m.contractAt('Bond', readBondUSTBAddress, { id: 'bondUSTB' });

  // Create fixed yield schedule for the bond
  const startDate = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // Start tomorrow
  const yieldRate = 500; // 5% annual yield (in basis points)
  const yieldInterval = 30 * 24 * 60 * 60; // 30 days in seconds

  // Create the yield schedule after granting the role
  const createYieldSchedule = m.call(
    fixedYieldFactory,
    'create',
    [ustb, startDate, oneYearFromNow, yieldRate, yieldInterval],
    {
      id: 'createYieldSchedule',
      from: deployer,
    }
  );

  const readYieldScheduleAddress = m.readEventArgument(createYieldSchedule, 'FixedYieldCreated', 'schedule', {
    id: 'readYieldScheduleAddress',
  });
  const yieldSchedule = m.contractAt('FixedYield', readYieldScheduleAddress, { id: 'yieldSchedule' });

  return { ustb, stableCoin, yieldSchedule };
});

export default BondsModule;
