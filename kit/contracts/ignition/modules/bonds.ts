import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import BondFactoryModule from './bond-factory';

const BondsModule = buildModule('BondsModule', (m) => {
  const { bondFactory } = m.useModule(BondFactoryModule);

  // Deploy a mock USDC for testing
  const mockUSDC = m.contract('ERC20Mock', ['USD Coin', 'USDC', 6], {
    id: 'mockUSDC',
  });

  const oneYearFromNow = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
  const faceValue = 100_000_000; // 100 USDC (with 6 decimals)

  // Create bond after USDC is deployed
  const createBondUSTB = m.call(
    bondFactory,
    'create',
    ['US Treasury Bond', 'USTB', 2, oneYearFromNow, faceValue, mockUSDC],
    {
      id: 'createBondUSTB',
    }
  );

  const readBondUSTBAddress = m.readEventArgument(createBondUSTB, 'BondCreated', 'token', {
    id: 'readBondUSTBAddress',
  });
  const ustb = m.contractAt('Bond', readBondUSTBAddress, { id: 'bondUSTB' });

  return { ustb, mockUSDC };
});

export default BondsModule;
